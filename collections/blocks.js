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
    check(block,{
      columnID: String,
      wallID: Match.Optional(String),  //could be included from pasted block, will be overwritten with denormalized values anyway
      activityID: Match.Optional(String), //same as above
      type: Match.OneOf('workSubmit','text','file','embed'), 
      idFromCopiedBlock: Match.Optional(String),
      visible: Match.Optional(Boolean),
      title: Match.Optional(String),
      text: Match.Optional(String),
      studentText: Match.Optional(String),
      teacherText: Match.Optional(String),
      embedCode: Match.Optional(String),
      raiseHand: Match.Optional(Match.OneOf('visible','')) //could be included from copied block
    });
    block.visible = block.visible || true; //might be pasting hidden block
    block.order = 0;  //always insert at top of column

    var column = Columns.findOne(block.columnID)
    if (!column)
      throw new Meteor.Error(202, "Cannot add block, not a valid column");
    block.wallID = column.wallID; //denormalize block
    block.activityID = column.activityID;

    if ('idFromCopiedBlock' in block) {
      var idFCB = block.idFromCopiedBlock;
      delete block.idFromCopiedBlock;
    }

    //move other blocks in column down to make room
    var ids = _.pluck(Blocks.find({columnID:block.columnID},{fields: {_id: 1}}).fetch(), '_id');
    Blocks.update({_id: {$in: ids}}, {$inc: {order:1}}, {multi: true});
    //add new block at top
    Blocks.insert(block, function(error,blockID) {
      //copy links to any associated files
      Files.find({blockID:idFCB}).forEach(function(file) {
        file.blockID = blockID;
        delete file._id;
        Meteor.call('insertFile',file);
      });      
    });

  },
  deleteBlock: function(blockID) {
    check(blockID,String);
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
    check(block,{
      _id: String,
      columnID: Match.Optional(String), //excluded below
      wallID: Match.Optional(String), //excluded below
      activityID: Match.Optional(String), //excluded below
      type: Match.Optional(String), //excluded below
      order: Match.Optional(Match.Integer), //excluded below
      visible: Match.Optional(Boolean),
      title: Match.Optional(String),
      text: Match.Optional(String),
      studentText: Match.Optional(String),
      teacherText: Match.Optional(String),
      embedCode: Match.Optional(String),
      raiseHand: Match.Optional(Match.OneOf('visible',''))
    });

    var keys = Object.keys(block);
    var fields = _.without(keys,'_id','order','type','columnID','wallID','activityID');
    fields.forEach(function(field) {
      var set = {};
      set[field] = block[field];
      Blocks.update(block._id,{$set: set});
    });
    if (_.intersection(keys,['columnID','wallID','activityID']).length > 0) 
      throw new Meteor.Error(232,"Use moveItem (from sortable1c method) instead of updateBlock to move the block to a new column.");
    if (_.contains(keys,'order'))
      throw new Meteor.Error(232,"Use sortItem (from sortable1c method) instead of updateBlock to move a block to a new position in the list.");
    if (_.contains(keys,'type'))
      throw new Meteor.Error(232,"Cannot change the type of a block.");
  },
  denormalizeBlock: function(blockID) {
    check(blockID,String);
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