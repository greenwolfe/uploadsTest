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
        Meteor.call('insertColumn',_id,0,null);
        Meteor.call('insertColumn',_id,0,'right');
        Meteor.call('insertColumn',_id,1,'right');
      }
    });
  }
});