'use strict';

const express = require('express');
// const uuid = require('uuid/v4');
const logger = require('./logger');
// const {bookmarks} = require('./bookmarks');
const xss = require('xss');
const BookmarksService = require('./bookmarks-service');
const { isWebUri } = require('valid-url');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});

bookmarkRouter
  .route('/api/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        });
      }
    }

    const { title, url, description, rating } = req.body;

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400).send({
        error: { message: '\'rating\' must be a number between 0 and 5' }
      });
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send({
        error: { message: '\'url\' must be a valid URL' }
      });
    }

    const newBookmark = { title, url, description, rating };

    BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
      .then(bookmark => {
        logger.info(`Bookmark with id ${bookmark.id} created.`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarkRouter
  .route('/api/bookmarks/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`);
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.deleteBookmark(req.app.get('db'), bookmark_id)
      .then(numRowsAffected => {
        logger.info(`Bookmark with id ${bookmark_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const updateBookmark = { title, url, description, rating };
    const { bookmark_id } = req.params;

    const numberOfValues = Object.values(updateBookmark).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message:
            'Request body must content either \'title\', \'url\', \'description\', \'rating\''
        }
      });
    }
    BookmarksService.updateBookmark(
      req.app.get('db'),
      bookmark_id,
      updateBookmark
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarkRouter;

// bookmarkRouter
//   .route('/bookmark')
//   .get((req, res) => {
//     res.json(bookmarks);
//   })
//   .post(bodyParser, (req, res) => {
//     const { title, url, description, rating } = req.body;

//     if (!title) {
//       logger.error('Need valid input');
//       return res
//         .status(400)
//         .send('Invalid data');
//     }

//     const bookmark = { id: uuid(), title, url, description, rating };
//     bookmarks.push(bookmark);

//     logger.info(`Bookmark with id ${bookmark.id} created`);

//     res
//       .status(201)
//       .location(`http://localhost:8000/bookmark/${bookmark.id}`)
//       .json(bookmark);
//   });

// bookmarkRouter
//   .route('/bookmark/:id')
//   .get((req, res) => {
//     const id = req.params.id;
//     let bookmark = bookmarks.filter(bookmark => bookmark.id === id);
//     res.json(bookmark);
//   })
//   .delete((req, res) => {
//     const id = req.params.id;
//     let index = bookmarks.findIndex(bookmark => bookmark.id === id);
//     bookmarks.splice(index, 1);
//     logger.info(`Bookmark with id ${id} deleted`);
//     res.status(204).end();
//   });

// module.exports = bookmarkRouter;
