Walls = new Meteor.Collection('walls');

/*
Walls.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  activityID: "abc", 
  type: ['teacher','student','group','section']
  owner: [studentID,[groupIDs],sectionID,'teacher']
});
*/

Meteor.methods({
  insertWall: function(wall) {
    Walls.insert(wall , function( error, _id) { 
      if ( error ) console.log ( error ); //info about what went wrong
      if ( _id ) {
        var column = {
          wallID: _id,
          width: 4,
          rank: 0
        }
        Meteor.call('insertColumn',column);
        column.rank = 1;
        Meteor.call('insertColumn',column);
        column.rank = 2;
        Meteor.call('insertColumn',column);
      }
    });
  }
});