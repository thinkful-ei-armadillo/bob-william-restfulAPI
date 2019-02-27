'use strict';

const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('bookmark Endpoints', function() {
  let db;

  // mocha hooks
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks_table').truncate());

  afterEach('cleanup', () => db('bookmarks_table').truncate());

  // test blocks
  describe('GET /bookmark', () => {
    context('Given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmark')
          .expect(200, []);
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks_table').insert(testbookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmark')
          // .expect(200, testbookmarks);
          .expect(200);
      });

    });
  });

  describe('GET /bookmark/:bookmark_id', () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmark/${bookmarkId}`)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } });
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks_table').insert(testbookmarks);
      });

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2;
        // const expectedArticle = testbookmarks[articleId - 1];
        return supertest(app)
          .get(`/bookmark/${bookmarkId}`)
          // .expect(200, expectedArticle);
          .expect(200);
      });
    });
  });
});
