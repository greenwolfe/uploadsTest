Blocks = new Meteor.Collection('Blocks');

/* Blocks.insert({
  _id: '...',
  columnID: '...',
  order: 2,
  type: ['text','image','file','embed'],
  title: '  ',
  text: '  ',
  image: fileID,
  embedCode: '  ',
  fileIDs: ['  ','  ']
}); */

Meteor.methods({
  insertBlock: function(block) {
    if (!('columnID' in block)) 
      throw new Meteor.Error(201, "Cannot add block, you did not specify a column to put it in.");
    var column = Columns.findOne(block.columnID)
    if (!column)
      throw new Meteor.Error(202, "Cannot add block, not a valid column");

    var validTypes = ['text','image','file','embed'];
    if (!('type' in block) || !_.contains(validTypes,block.type))
      throw new Meteor.Error(203,"Cannot add block, invalid type.")

    var ids = _.pluck(Blocks.find({columnID:block.columnID},{fields: {_id: 1}}).fetch(), '_id');
    Blocks.update({_id: {$in: ids}}, {$inc: {order:1}}, {multi: true});
    block.order = 0;
    Blocks.insert(block);
  },
  deleteBlock: function(blockID) {
    block = Blocks.findOne(blockID);
    if (!block)
      throw new Meteor.Error(203,"Cannot delete block, block not found.")
    
    var ids = _.pluck(Blocks.find({columnID:block.columnID,order:{$gt: block.order}},{fields: {_id: 1}}).fetch(), '_id');
    Blocks.remove(blockID); 
    Blocks.update({_id: {$in: ids}}, {$inc: {order:-1}}, {multi: true});
  },
  updateBlock: function(block) {
    var fields = Object.keys(block);
    fields.forEach(function(field) {
      var set = {};
      var excludedFields = ['_id','order','columnID'];
      if (!_.contains(excludedFields,field)) {
        set[field] = block[field];
        Blocks.update(block._id,{$set: set});
      }
    });
    if (_.contains(fields,'columnID')) 
      throw new Meteor.Error(232,"Use moveBlockToNewColumn instead of updateBlock to move the block to a new column.");
    if (_.contains(fields,'order'))
      throw new Meteor.Error(232,"Use moveBlockWithinList instead of updateBlock to move a block to a new position in the list.");
  },
  blockAddFile: function(blockID,fileID) {
    var block = Blocks.findOne(blockID);
    if (!block)
      throw new Meteor.Error(252,"Cannot add file.  Invalid block.");
    var file = Files.findOne(fileID,{fields:{_id:1}});
    if (!file) 
      throw new Meteor.Error(253,"Cannot add file.  Invalid file.");
    Blocks.update(blockID,{$addToSet: {files:file}});
  },
  blockRemoveFile: function(blockID,fileID) {
    var block = Blocks.findOne(blockID);
    if (!block)
      throw new Meteor.Error(252,"Cannot remove file.  Invalid block.");
    var file = Files.findOne(fileID,{fields:{_id:1}});
    if (!file) 
      throw new Meteor.Error(253,"Cannot remove file.  Invalid file.");
    Blocks.update(blockID,{ $pull: { files: { _id: fileID } } });
  }
});