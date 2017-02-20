import jwt from 'jsonwebtoken';
import marked from 'marked';
import fs from 'fs';

// Index page with the API guide
export function getIndex(req, res) {
  const path = 'README.md';
  fs.readFile(path, 'utf8', (err, data) => {
    if(err) {
      console.log(err);
    }
    res.send(marked(data.toString()));
  });
}
