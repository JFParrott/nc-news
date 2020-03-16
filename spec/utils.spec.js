const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('returns a new array', () => {
    const input = [
      { user_id: 6, created_at: 1542284514171 },
      { user_id: 4, created_at: 1542282514171 }
    ];
    const result = formatDates(input);
    expect(result).to.be.an('array');
    expect(result).to.not.equal(input);
  });
  it('does not mutate original array', () => {
    const input = [
      { user_id: 6, created_at: 1542284514171 },
      { user_id: 4, created_at: 1542282514171 }
    ];
    formatDates(input);
    const control = [
      { user_id: 6, created_at: 1542284514171 },
      { user_id: 4, created_at: 1542282514171 }
    ];
    expect(input).to.eql(control);
  });
  it('returns an empty array when passed an empty array', () => {
    const input = formatDates([]);
    expect(input).to.eql([]);
  });
  it('returns a correctly formatted array when passed array contains single item', () => {
    const input = [{ user_id: 1, created_at: 533132514171 }];
    const formattedList = formatDates(input);
    expect(formattedList).to.eql([
      { user_id: 1, created_at: new Date(533132514171) }
    ]);
  });
  it('returns a correctly formatted array when passed array greater than length 1', () => {
    const input = [
      { user_id: 1, created_at: 533132514171 },
      { user_id: 2, created_at: 659276514171 }
    ];
    const formattedList = formatDates(input);
    expect(formattedList).to.eql([
      { user_id: 1, created_at: new Date(533132514171) },
      { user_id: 2, created_at: new Date(659276514171) }
    ]);
  });
});

describe('makeRefObj', () => {
  it('returns an empty object when passed an empty array', () => {
    const input = [];
    const actual = makeRefObj(input);
    const expected = {};
    expect(actual).to.eql(expected);
  });
  it('returns correct reference object when passed an array with single object', () => {
    const input = [{ article_id: 1, title: 'A' }];
    const actual = makeRefObj(input);
    const expected = { A: 1 };
    expect(actual).to.eql(expected);
  });
  it('does not mutate original array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    makeRefObj(input);
    const control = [{ article_id: 1, title: 'A' }];
    expect(input).to.eql(control);
  });
  it('returns correct reference object when passed an array with multiple objects', () => {
    const input = [
      { article_id: 1, title: 'A' },
      { article_id: 2, title: 'B' },
      { article_id: 3, title: 'C' }
    ];
    const actual = makeRefObj(input);
    const expected = { A: 1, B: 2, C: 3 };
    expect(actual).to.eql(expected);
  });
});

describe('formatComments', () => {
  it('returns an empty array when passed an empty array', () => {
    const formattedComments = formatComments([], { A: 1 });
    expect(formattedComments).to.eql([]);
  });
  it('returns a correctly formatted array when only one object in array', () => {
    const input = [
      {
        body: 'This morning, I showered for nine minutes.',
        belongs_to: 'A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    const articleRef = { A: 1 };
    const editedComment = formatComments(input, articleRef);
    const expectedComment = [
      {
        body: 'This morning, I showered for nine minutes.',
        article_id: 1,
        author: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    expect(editedComment).to.eql(expectedComment);
  });
  it('does not mutate original array', () => {
    const input = [
      {
        body: 'This morning, I showered for nine minutes.',
        belongs_to: 'A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    const articleRef = { A: 1 };
    formatComments(input, articleRef);
    const control = [
      {
        body: 'This morning, I showered for nine minutes.',
        belongs_to: 'A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    expect(input).to.eql(control);
  });
  it('returns a new array', () => {
    const input = [
      {
        body: 'This morning, I showered for nine minutes.',
        belongs_to: 'A',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    const articleRef = { A: 1 };
    const editedComment = formatComments(input, articleRef);
    expect(editedComment).to.be.an('array');
    expect(editedComment).to.not.equal(input);
  });
  it('returns correctly formatted array when passed array of length greater than 1', () => {
    const input = [
      {
        body: 'The owls are not what they seem.',
        belongs_to: 'A',
        created_by: 'icellusedkars',
        votes: 20,
        created_at: 1006778163389
      },
      {
        body: 'This morning, I showered for nine minutes.',
        belongs_to: 'B',
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    const articleRef = { A: 1, B: 2 };
    const editedComments = formatComments(input, articleRef);
    const expectedComments = [
      {
        body: 'The owls are not what they seem.',
        article_id: 1,
        author: 'icellusedkars',
        votes: 20,
        created_at: 1006778163389
      },
      {
        body: 'This morning, I showered for nine minutes.',
        article_id: 2,
        author: 'butter_bridge',
        votes: 16,
        created_at: 975242163389
      }
    ];
    expect(editedComments).to.eql(expectedComments);
  });
});
