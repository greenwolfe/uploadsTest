Template.column.helpers({
  blocks: function() {
    return Blocks.find({columnID:this._id},{sort: {order:1}});
  },
  empty: function() {
    var blocks = Blocks.find({columnID:this._id},{sort: {order:1}}).fetch();
    return (blocks.length > 0) ? '' : 'empty';
  },
  inEditedWall: function() {
    return (Session.get('editedWall') == this.wallID);
  },
  disableShrink: function() {
    return (this.width > 2) ? '':'disabled';
  },
  disableExpand: function() {
    var widths = _.pluck(Columns.find({wallID:this.wallID},{fields:{width:1}}).fetch(),'width');
    var totalWidth = widths.reduce(function(a, b){return a+b;})
    return (totalWidth < 12) ? '':'disabled';
  },
  disableAdd: function() {
    var widths = _.pluck(Columns.find({wallID:this.wallID},{fields:{width:1}}).fetch(),'width');
    var totalWidth = widths.reduce(function(a, b){return a+b;})
    return (totalWidth < 11) ? '':'disabled';
  },
  disableDelete: function() {
    var numBlocks = Blocks.find({columnID:this._id}).count();
    var numColumns = Columns.find({wallID:this.wallID}).count();
    return ((numColumns >1) && (numBlocks == 0)) ? '':'disabled';
  },
  sortableOpts: function() {
    return {
      draggable:'.block',
      handle: '.panel-heading',
      group: 'column',
      columnID: this._id,
    }
  }
});

Template.column.events({
  'click .addImageBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'image',
      title: 'title'
    }
    Meteor.call('insertBlock',block);
  },
  'click .shrinkColumn': function(event,tmpl) {
    Meteor.call('shrinkColumn',tmpl.data._id);
  },
  'click .expandColumn': function(event,tmpl) {
    Meteor.call('expandColumn',tmpl.data._id);
  },
  'click .addLeft': function(event,tmpl) {
    Meteor.call('insertColumn',tmpl.data.wallID,tmpl.data.order,'left');
  },
  'click .addRight': function(event,tmpl) {
    Meteor.call('insertColumn',tmpl.data.wallID,tmpl.data.order,'right');
  },
  'click .deleteColumn': function(event,tmpl) {
    Meteor.call('deleteColumn',tmpl.data._id);
  }
});