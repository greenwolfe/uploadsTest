Walls = new Meteor.Collection('Walls');

/*
Walls.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  activityID: "abc", 
  type: ['teacher','student','group','section']
  owner: [studentID,[groupIDs],sectionID,'teacher'],
            //maybe no need for this?  
            //any teacher can post to teacher wall
            //when teacher posts to student or group or section well,
            //viewAs menu has selected them, so clear who it is posted to
            //blocks will have an owner, not walls or columns
  order: 0,
  visible: true
});
*/

Meteor.methods({
  insertWall: function(wall) {
    //validate activityID, type
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
