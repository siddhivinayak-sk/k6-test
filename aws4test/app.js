var https = require('https')
var aws4  = require('aws4')
var crypto = require('crypto');
var fs = require('fs');

var fileBuffer = fs.readFileSync('1.jpg');
var hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);
var hex = hashSum.digest('hex');


var opts = aws4.sign({
  host: 'minio-api.dev22r1.sbcp.io',
  path: '/sbcp-minio-bucket/core-4/external-flm/usecaseB/62da87eda3923870900da6da',
  service: 's3',
  region: 'us-east-1',
  method: 'PUT',
  
  headers: {
	'X-Amz-Content-Sha256': hex
  },
  body: undefined
}, { 
  accessKeyId: 'minioadmin', 
  secretAccessKey: 'RninwIG0Tkt3SmVi2jBT'
  //sessionToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiI5NDc3TFY3TkZNQkVES01DVDNTUiIsImV4cCI6MTY1ODQ5MjQxMywicGFyZW50IjoiY29yZS00Iiwic2Vzc2lvblBvbGljeSI6ImV5SnpkR0YwWlcxbGJuUWlPbHQ3SW1GamRHbHZiaUk2V3lKek16cFFkWFJQWW1wbFkzUWlYU3dpY21WemIzVnlZMlVpT2xzaVlYSnVPbUYzY3pwek16bzZPbk5pWTNBdGJXbHVhVzh0WW5WamEyVjBMMk52Y21VdE5DOXpZbU53TFdac2JTOTFjMlZqWVhObFFTODJNbVJoT0RkbFpHRXpPVEl6T0Rjd09UQXdaR0UyWkdFaVhTd2laV1ptWldOMElqb2lRV3hzYjNjaWZWMHNJblpsY25OcGIyNGlPaUl5TURFeUxURXdMVEUzSW4wPSJ9.Uo7pwZUSF5Fn0HXnKZ3tW2jz2VVA8nbDLhru7ANGieeVXDSWXCAVEv4o-NXrEUHlvH7SSbQguMOkgGHMZdrTfA'
}
)

opts.path = 'https://minio-api.dev22r1.sbcp.io/sbcp-minio-bucket/core-4/external-flm/usecaseB/62da87eda3923870900da6da';
opts.headers['Content-Type'] = 'image/jpeg';
opts.headers['User-Agent'] = 'PostmanRuntime/7.29.2';
opts.headers['Postman-Token'] = '47a8e1a0-87df-40a1-a021-f9010e3f6690_7';
opts.headers['Content-Length'] = fileBuffer.length;

console.log(opts)

var req = https.request(opts, function(res) {
	
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');

  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
  
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(fileBuffer);
req.end();
