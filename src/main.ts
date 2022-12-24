import { logger } from './utils/logger';
import { PORT, DBNAME } from './config';
import { loadDB } from './db';
import { AppContext } from './types/context.d';
import * as apis from './request';

const http = require('http');

async function main() {
  const server = http.createServer();

  const db = await loadDB(DBNAME);
  server.on('request', async(req: any, res: any) => {
    let url = new URL(req.url, `http://${req.headers.host}`)
    let resCode = 200
    let resBody: any = {}
    const restfulHead = '/api/v0'
    const reqHead = url.pathname.substr(0, restfulHead.length)
    if (reqHead !== restfulHead) {
      resBody = {
        statusCode: 404,
        message: `unknown request:${url.pathname}`
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resBody));
      return
    }
    const route = url.pathname.substr(restfulHead.length);
    if (req.method === 'GET') {
      // Do GET request
      if ('/account/whitelist' === route) {
        const address = url.searchParams.get('address') || '';
        resBody = await apis.inWhitelist(address);
        resCode = resBody.statusCode;
      } else if ('/account/profiles' === route) {
        const address = url.searchParams.get('address') || '';
        resBody = await apis.getProfileList(address);
        resCode = resBody.statusCode;
      } else if ('/hello' === route) {
        resBody = {
          statusCode: 200,
          message: 'Hello, nosocial api!',
        };
        resCode = resBody.statusCode;
      } else {
        resBody = {
          statusCode: 404,
          message: `Unknown request:${url.pathname}`,
        }
        resCode = resBody.statusCode;
      }
    } else if (req.method === 'POST') {
      // Do POST request
      if ('/get/profiles' === route) {
      } else if ('/get/publications' === route) {
      } else {
        resBody = {
          statusCode: 404,
          message: `Unknown request:${url.pathname}`,
        }
        resCode = resBody.statusCode;
      }
    } else {
      // Other type request
    }
    res.writeHead(resCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(resBody));
  });
  server.listen(PORT, '0.0.0.0');
  logger.info(`Start api on port:${PORT} successfully`)
}

main()
  .catch((e: any) => {
    logger.error(e.message);
    process.exit(1);
  })
