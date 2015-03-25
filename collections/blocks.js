Blocks = new Meteor.Collection('Blocks');

/* Blocks.insert({
  _id: '...',
  columnID: '...',
  rank: 2,
  type: ['text','image','file','embed'],
  title: '  ',
  text: '  ',
  image: fileID,
  embedCode: '  ',
  fileIDs: ['  ','  ']
}); */

Meteor.methods({
  insertBlock: function(block) {
    Blocks.insert(block);
  },
  deleteBlock: function(block) {
    Blocks.remove(block);
  },
  updateBlock: function(block) {
    block.forEach(function(field) {
      var set = {};
      set[field] = block.field;
      Blocks.update(block._id,{$set: set});
    });
  }
})