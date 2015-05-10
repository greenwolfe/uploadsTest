Blocks = new Meteor.Collection('Blocks');

/* Blocks.insert({
  _id: '...',
  columnID: '...',
  wallID: column.wallID, 
  activityID: column.activityID, //inherited from wall.activityID
  order: 2,
  type: ['workSubmit',text','file','embed'],
  title: '  ',
  text: '  ',
  embedCode: '  ',
  studentText: '   ',
  teacherText: '   ',
  visible: true
}); */

Meteor.methods({
  insertBlock: function(block) {
    if (!('columnID' in block)) 
      throw new Meteor.Error(201, "Cannot add block, you did not specify a column to put it in.");
    var column = Columns.findOne(block.columnID)
    if (!column)
      throw new Meteor.Error(202, "Cannot add block, not a valid column");
    block.wallID = column.wallID; //denormalize block
    block.activityID = column.activityID;

    var validTypes = ['workSubmit','text','file','embed'];
    if (!('type' in block) || !_.contains(validTypes,block.type))
      throw new Meteor.Error(203,"Cannot add block, invalid type.")
    if (!('visible' in block))
      block.visible = true;

    if ('idFromCopiedBlock' in block) {
      var idFCB = block.idFromCopiedBlock;
      delete block.idFromCopiedBlock;
    }

    //move other blocks in column down to make room
    var ids = _.pluck(Blocks.find({columnID:block.columnID},{fields: {_id: 1}}).fetch(), '_id');
    Blocks.update({_id: {$in: ids}}, {$inc: {order:1}}, {multi: true});
    //add new block at top
    block.order = 0;
    var blockID = Blocks.insert(block);
    //copy links to any associated files
    Files.find({blockID:idFCB}).forEach(function(file) {
      file.blockID = blockID;
      delete file._id;
      Files.insert(file);
    });
  },
  deleteBlock: function(blockID) {
    block = Blocks.findOne(blockID);
    if (!block)
      throw new Meteor.Error(203,"Cannot delete block, block not found.")
    var fileCount = Files.find({blockID:blockID}).count();
    if (fileCount > 0) return; 
      //throw error as well?

    var ids = _.pluck(Blocks.find({columnID:block.columnID,order:{$gt: block.order}},{fields: {_id: 1}}).fetch(), '_id');
    Blocks.remove(blockID); 
    Blocks.update({_id: {$in: ids}}, {$inc: {order:-1}}, {multi: true});
  },
  updateBlock: function(block) {
    var fields = Object.keys(block);
    fields.forEach(function(field) {
      var set = {};
      var excludedFields = ['_id','order','columnID','wallID','activityID'];
      if (!_.contains(excludedFields,field)) {
        set[field] = block[field];
        Blocks.update(block._id,{$set: set});
      }
    });
    if (_.contains(fields,'columnID')) 
      throw new Meteor.Error(232,"Use moveItem (from sortable1c method) instead of updateBlock to move the block to a new column.");
    if (_.contains(fields,'order'))
      throw new Meteor.Error(232,"Use sortItem (from sortable1c method) instead of updateBlock to move a block to a new position in the list.");
  },
  denormalizeBlock: function(blockID) {
    block = Blocks.findOne(blockID);
    if (!block)
      throw new Meteor.Error(203,"Cannot denormalize block, block not found.")
    var column = Columns.findOne(block.columnID);
    Blocks.update(block._id,{$set:{wallID:column.wallID}});
    Blocks.update(block._id,{$set:{activityID:column.activityID}});
    Files.find({blockID:block._id}).forEach(function(file) { 
      Meteor.call('denormalizeFile',file._id);
    });  
  }
});