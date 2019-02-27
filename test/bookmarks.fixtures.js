'use strict';

function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Yahoo',
      url: 'https://www.thinkful.com',
      description: 'Think outside the classroom',
      rating: 1
    },
    {
      id: 2,
      title: 'ESPN',
      url: 'https://www.google.com',
      description: 'Where we find everything else',
      rating: 3
    },
    {
      id: 3,
      title: 'MDN',
      url: 'https://developer.mozilla.org',
      description: 'The only place to find web documentation',
      rating: 5
    }
  ];
}

module.exports = {
  makeBookmarksArray,
};