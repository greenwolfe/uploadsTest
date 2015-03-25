Template.wall.helpers({
  title: function() {
    if (this.type == 'teacher') return 'Teacher Area';
    if (this.type == 'student') return 'Student Area';
    if (this.type == 'group') return 'Group: list of names';
    if (this.type == 'section') return 'B block';
    return '';
  },
  columns: function() {
    return Columns.find({wallID:this._id},{$sort: {rank:1}});
  }
})

Template.wall.events({
  'click .addImageBlock': function(event,tmpl) {
    console.log(tmpl);
    var column = Columns.findOne({wallID:tmpl.data._id});
    var block = {
      columnID: column._id,
      rank: 1,
      type: 'image',
      title: 'title'
    }
    Meteor.call('insertBlock',block);
  }
})