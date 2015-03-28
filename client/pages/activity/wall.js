Template.wall.helpers({
  title: function() {
    if (this.type == 'teacher') return 'Teacher Wall';
    if (this.type == 'student') return 'Student Wall';
    if (this.type == 'group') return 'Group Wall: list of names';
    if (this.type == 'section') return 'B block Wall';
    return '';
  },
  columns: function() {
    return Columns.find({wallID:this._id},{sort: {order:1}});
  },
  editColumns: function() {
    return (Session.get('editedWall') == this._id) ? 'Done' : 'Edit Wall';
  }
})

Template.wall.events({
  'click .editColumns': function(event,tmpl) {
    var wall = tmpl.data._id;
    if (Session.get('editedWall') != wall) {
      Session.set('editedWall',wall)
    } else {
      Session.set('editedWall',null);
    }
  }
})