'use strict';

const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const BookmarksService = require('./bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/bookmark')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error('Need valid input');
      return res.status(400).send('Invalid data');
    }

    const bookmark = { id: uuid(), title, url, description, rating };
    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${bookmark.id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${bookmark.id}`)
      .json(bookmark);
  });

bookmarkRouter
  .route('/bookmark/:id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getById(knexInstance, req.params.id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req, res) => {
    const id = req.params.id;
    let index = bookmarks.findIndex(bookmark => bookmark.id === id);
    bookmarks.splice(index, 1);
    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;
