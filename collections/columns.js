Columns = new Meteor.Collection('Columns');

/*
columns.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  wallID: "abc", 
  width: 3,
  rank: 0
});
*/

Meteor.methods({
  insertColumn: function(column) {
    Columns.insert(column);
  },
  deleteColumn: function(_id) {
    Columns.delete(_id);
  },
  expandColumn: function(_id) {
    Columns.update(_id,{$inc: {width:1}})
  },
  shrinkColumn: function(_id) {
    Columns.update(_id,{$inc: {width:-1}})
  }
})