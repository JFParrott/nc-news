exports.formatDates = list => {
  const mapped = list.map(item => {
    const event = new Date(item.created_at);
    return {
      ...item,
      created_at: event
    };
  });
  return mapped;
};

exports.makeRefObj = list => {
  const refObj = {};
  for (let i = 0; i < list.length; i++) {
    refObj[list[i].title] = list[i].article_id;
  }
  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  const editedComments = comments.map(comment => {
    const commentData = {
      ...comment,
      author: comment.created_by,
      article_id: articleRef[comment.belongs_to]
    };
    delete commentData.created_by;
    delete commentData.belongs_to;
    return commentData;
  });
  return editedComments;
};
