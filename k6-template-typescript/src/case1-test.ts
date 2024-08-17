import { sleep, check, bytes } from 'k6';
import http    from 'k6/http';
import { Options } from 'k6/options';
import crypto, { hmac, sha256, md5 } from 'k6/crypto';
import { AppConsts } from './consts/AppConsts';
import { signHeaders, AWSConfig, toTime} from './consts/util'





const binFile = open('../1.jpg', 'b');

export function scenario_1() {
  let response
  response = http.get('https://httpbin.org/status/200', {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })

  sleep(1);

  const host = 'minio-api.dev22r1.sbcp.io';
  const remotePath = '/sbcp-minio-bucket/core-2/other/202211181716_2';
  const url = 'https://' + host + remotePath;
  const date = new Date();
  const rawHeaders = {
    'Host': host,
    'X-Amz-Content-Sha256': crypto.sha256(binFile || '', 'hex').toLowerCase(),
    'X-Amz-Date': toTime(date.getTime())
  };
  const awsConfig: AWSConfig = new AWSConfig({
    region: 'us-east-1',
    accessKeyId: 'minioadmin',
    secretAccessKey: 'RninwIG0Tkt3SmVi2jBT',
    rgw: true
  });
  const uRIEncodingConfig = {
    double: false,
     path: true
    };

  let headers = signHeaders(
    rawHeaders,
    date.getTime(),
    'PUT',
    remotePath,
    '',
    binFile,
    awsConfig,
    's3',
    uRIEncodingConfig
  );

  headers = {
    ...headers,
    'Content-Type': 'image/jpeg',
    'Content-Length': binFile.byteLength + '',
    'User-Agent': 'SBSTool'
  }

  //console.log(headers);
  
  let res = http.request('PUT', url, binFile, {
    headers: headers
  });
  console.log('Response Header: ' + res.status);
  //console.log(res.headers);
  console.log(res.error);
  console.log(res.error_code);
};

export function scenario_2() {
  let response

  response = http.get('https://httpbin.org/status/200', {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.del('https://httpbin.org/status/200', null, {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      origin: 'https://httpbin.org',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.patch('https://httpbin.org/status/200', null, {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      origin: 'https://httpbin.org',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.post('https://httpbin.org/status/201', null, {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      origin: 'https://httpbin.org',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.put('https://httpbin.org/status/200', null, {
    headers: {
      accept: 'text/plain',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      origin: 'https://httpbin.org',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.get('https://httpbin.org/get', {
    headers: {
      accept: 'application/json',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
  sleep(1)

  response = http.post('https://httpbin.org/post', null, {
    headers: {
      accept: 'application/json',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9',
      origin: 'https://httpbin.org',
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  })
};


export const options:Options = {
  ext: {
    loadimpact: {
      distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
      apm: [],
    },
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '1m' },
        { target: 10, duration: '3m30s' },
        { target: 1, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
    Scenario_2: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 7, duration: '1m' },
        { target: 20, duration: '2m30s' },
        { target: 2, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_2',
    },
  },
};
