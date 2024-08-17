import crypto, { hmac, sha256, md5 } from 'k6/crypto'


export type HTTPScheme = 'http' | 'https';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type HTTPHeaders = { [key: string]: string };

export class AWSConfig {
    region: string
    accessKeyID: string
    secretAccessKey: string
    sessionToken?: string
    scheme: HTTPScheme = 'https'
    endpoint: string = 'minio.dev22r1.sbcp.io'
    rgw: boolean = false
    constructor(options: AWSConfigOptions) {
        this.region = options.region
        this.accessKeyID = options.accessKeyId
        this.secretAccessKey = options.secretAccessKey
        if (options.sessionToken !== undefined) {
            this.sessionToken = options.sessionToken
        }
        if (options.scheme !== undefined) {
            this.scheme = options.scheme
        }
        if (options.endpoint !== undefined) {
            this.endpoint = options.endpoint
        }
        if (options.rgw !== undefined) {
            this.rgw = options.rgw
        }
    }
}

export interface AWSConfigOptions {
    region: string
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
    scheme?: HTTPScheme
    endpoint?: string
    rgw?: boolean
}


export function signHeaders(
    headers: HTTPHeaders,
    requestTimestamp: number,
    method: HTTPMethod,
    path: string,
    queryString: string,
    body: string | ArrayBuffer,
    awsConfig: AWSConfig,
    service: string,
    URIencodingConfig: URIEncodingConfig
): HTTPHeaders {
    if (awsConfig.sessionToken) {
        headers['X-Amz-Security-Token'] = awsConfig.sessionToken
    }

    const derivedSigningKey = deriveSigningKey(
        awsConfig.secretAccessKey,
        requestTimestamp,
        awsConfig.region,
        service
    )

    const canonicalRequest = createCanonicalRequest(
        method,
        path,
        queryString,
        headers,
        body,
        URIencodingConfig
    )

    const stringToSign = createStringToSign(
        requestTimestamp,
        awsConfig.region,
        service,
        sha256(canonicalRequest, 'hex')
    )

    const credentialScope = createCredentialScope(requestTimestamp, awsConfig.region, service)
    const signedHeaders = createSignedHeaders(headers)
    const signature = calculateSignature(derivedSigningKey, stringToSign)
    const authorizationHeader = `${HashingAlgorithm} Credential=${awsConfig.accessKeyID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    headers['Authorization'] = authorizationHeader

    return headers
}

export function calculateSignature(derivedSigningKey: ArrayBuffer, stringToSign: string): string {
    return hmac('sha256', derivedSigningKey, stringToSign, 'hex')
}

export function deriveSigningKey(
    secretAccessKey: string,
    time: number,
    region: string,
    service: string
): ArrayBuffer {
    const kSecret = secretAccessKey
    const date = toDate(time)
    const kDate: any = hmac('sha256', 'AWS4' + kSecret, date, 'binary')
    const kRegion: any = hmac('sha256', kDate, region, 'binary')
    const kService: any = hmac('sha256', kRegion, service, 'binary')
    const kSigning: any = hmac('sha256', kService, 'aws4_request', 'binary')
    return kSigning
}

export const HashingAlgorithm = 'AWS4-HMAC-SHA256'
export const UnsignedPayload = 'UNSIGNED-PAYLOAD'

export function createStringToSign(
    requestTimestamp: number,
    region: string,
    service: string,
    hashedCanonicalRequest: string
): string {
    const requestDateTime = toTime(requestTimestamp)
    const credentialScope = createCredentialScope(requestTimestamp, region, service)

    const stringToSign = [
        HashingAlgorithm,
        requestDateTime,
        credentialScope,
        hashedCanonicalRequest,
    ].join('\n')

    return stringToSign
}

export function createCredentialScope(
    requestTimestamp: number,
    region: string,
    service: string
): string {
    return [toDate(requestTimestamp), region, service, 'aws4_request'].join('/')
}

export function createCanonicalRequest(
    method: HTTPMethod,
    uri: string,
    query: string,
    headers: HTTPHeaders,
    payload: string | ArrayBuffer,
    URIencodingConfig: URIEncodingConfig
): string {
    const httpRequestMethod = method.toUpperCase()
    const canonicalURI = createCanonicalURI(uri, URIencodingConfig)
    const canonicalQueryString = createCanonicalQueryString(query)
    const canonicalHeaders = createCanonicalHeaders(headers)
    const signedHeaders = createSignedHeaders(headers)
    const requestPayload = createCanonicalPayload(payload)

    const canonicalRequest = [
        httpRequestMethod,
        canonicalURI,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        requestPayload,
    ].join('\n')

    return canonicalRequest
}

export function createCanonicalURI(uri: string, URIencodingConfig: URIEncodingConfig): string {
    if (uri == '/') {
        return uri
    }

    let canonicalURI = uri
    if (uri[uri.length - 1] == '/' && canonicalURI[canonicalURI.length - 1] != '/') {
        canonicalURI += '/'
    }

    canonicalURI = URIEncode(canonicalURI, URIencodingConfig.path)

    return URIencodingConfig.double ? URIEncode(canonicalURI, URIencodingConfig.path) : canonicalURI
}

export function createCanonicalQueryString(qs: string): string {
    if (qs === '') {
        return ''
    }
    return parseQueryString(qs)
        .map(([key, value]: [string, string]): string => {
            let uriComponent = encodeURIComponent(key) + '='
            if (value !== 'undefined') {
                uriComponent += encodeURIComponent(value)
            }

            return uriComponent
        })
        .join('&')
}

export function createCanonicalHeaders(headers: HTTPHeaders) {
    if (headers.constructor !== Object || Object.entries(headers).length === 0) {
        return ''
    }

    const canonicalHeaders = Object.entries(headers)
        .map(([name, values]) => {
            const canonicalName = name.toLowerCase().trim()
            const normalizedValues = Array.isArray(values) ? values : [values]

            const canonicalValues = normalizedValues
                .map((v) => {
                    return v.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
                })
                .join(',') 
            return canonicalName + ':' + canonicalValues + '\n'
        })
        .sort()
        .join('')
    return canonicalHeaders
}

export function createSignedHeaders(headers: { [key: string]: string }) {
    if (headers.constructor !== Object) {
        throw new TypeError('headers should be an object')
    }

    if (Object.entries(headers).length === 0) {
        throw 'headers should at least contain either the Host (HTTP 1.1) or :authority (HTTP 2) parameter'
    }

    const result = Object.keys(headers)
        .map((name) => name.toLowerCase().trim())
        .sort()
        .join(';')

    return result
}

export function createCanonicalPayload(payload: string | ArrayBuffer) {
    if (payload === UnsignedPayload) {
        return payload
    }
    return crypto.sha256(payload || '', 'hex').toLowerCase()
}

export function URIEncode(uri: string, path: boolean): string {
    if (uri == '') {
        return uri
    }

    return uri
        .split('')
        .map((letter: string) => {
            if (isAlpha(letter) || isNumeric(letter) || '-._~'.includes(letter)) {
                return letter
            }

            if (letter == ' ') {
                return '%20'
            }

            if (letter == '/' && path) {
                return '/'
            }

            return '%' + letter.charCodeAt(0).toString(16).toUpperCase()
        })
        .join('')
}

export class URIEncodingConfig {
    double: boolean
    path: boolean

    constructor(double: boolean, path: boolean) {
        this.double = double
        this.path = path
    }
}

export function toTime(timestamp: number): string {
    return new Date(timestamp).toISOString().replace(/[:\-]|\.\d{3}/g, '')
}

export function toDate(timestamp: number): string {
    return toTime(timestamp).substring(0, 8)
}

export function parseQueryString(qs: string): Array<[string, string]> {
    if (qs.length === 0) {
        return []
    }

    return qs
        .split('&')
        .filter((e) => e)
        .map((v: string): [string, string] => {
            const parts = v.split('=', 2) as [string, string]
            const key = decodeURIComponent(parts[0])
            let value = decodeURIComponent(parts[1])
            if (value === 'undefined') {
                value = ''
            }
            return [key, value]
        })
        .sort((a: [string, string], b: [string, string]) => {
            return a[0].localeCompare(b[0])
        })
}

function isAlpha(c: string): boolean {
    return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')
}

function isNumeric(c: string): boolean {
    return c >= '0' && c <= '9'
}