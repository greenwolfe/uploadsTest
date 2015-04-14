Columns = new Meteor.Collection('Columns');

/*
Columns.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  wallID: "abc", 
  width: 3,
  order: 0,
  visible:true
});
*/

Meteor.methods({
  insertColumn: function(wallID,order,side) {
    var wall = Walls.find(wallID);
    if (!wall)
      throw new Meteor.Error(240,"Cannot add column, invalid wall.");
    var widths = _.pluck(Columns.find({wallID:wallID},{fields:{width:1}}).fetch(),'width');
    var totalWidth = widths.reduce(function(a, b){return a+b;},0)
    if (totalWidth == 0) { //first column in wall
      Columns.insert({
        wallID:wallID,
        width:4,
        order: 0,
        visible: true
      });
      return;
    }
    var width = Math.min(12-totalWidth,4);
    if (width < 2) return; // not enough space to add a column

    var ids = [];
    if (side == 'right') {  
      ids = _.pluck(Columns.find({wallID:wallID,order:{$gt: order}},{fields: {_id: 1}}).fetch(), '_id');
      order = order + 1;
    } else if (side == 'left') {  
      ids = _.pluck(Columns.find({wallID:wallID,order:{$gte: order}},{fields: {_id: 1}}).fetch(), '_id');
    } 
    Columns.update({_id: {$in: ids}}, {$inc: {order:1}}, {multi: true});
    Columns.insert({
      wallID:wallID,
      width:width,
      order: order,
      visible: true
    });
  },
  deleteColumn: function(_id) {
    var column = Columns.findOne(_id);
    if (!column)
      throw new Meteor.Error(240,"Cannot delete column, invalid column ID.");
    var numBlocks = Blocks.find({columnID:column._id}).count();
    var numColumns = Columns.find({wallID:column.wallID}).count();
    if ((numBlocks > 0) || (numColumns == 1)) return;
    var ids = _.pluck(Columns.find({wallID:column.wallID,order:{$gt: column.order}},{fields: {_id: 1}}).fetch(), '_id');
    Columns.remove(_id);
    Columns.update({_id: {$in: ids}}, {$inc: {order:-1}}, {multi: true});    
  },
  expandColumn: function(_id) {
    var column = Columns.findOne(_id);
    var widths = _.pluck(Columns.find({wallID:column.wallID},{fields:{width:1}}).fetch(),'width');
    var totalWidth = widths.reduce(function(a, b){return a+b;})
    if (totalWidth < 12) 
      Columns.update(_id,{$inc: {width:1}})
  },
  shrinkColumn: function(_id) {
    var column = Columns.findOne(_id);
    if (column.width > 2)
      Columns.update(_id,{$inc: {width:-1}})
  },
  hideColumn: function(columnID) {
    var column = Columns.find(columnID);
    if (!column) 
      throw new Meteor.Error(101,'Cannot hide column, invalide columnID');
    Columns.update(columnID,{$set: {visible:false}});
  },
  showColumn: function(columnID) {
    var column = Columns.find(columnID);
    if (!column) 
      throw new Meteor.Error(101,'Cannot hide column, invalide columnID');
    Columns.update(columnID,{$set: {visible:true}});
  }
})