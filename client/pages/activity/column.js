//add a paste block(s) option to paste copied blocks into the column
Template.column.helpers({
  blocks: function() {
    var selector = {columnID:this._id};
    if (Session.get('editedWall') != this.wallID) //if not editing
      selector.visible = true //show only visible blocks
    return Blocks.find(selector,{sort: {order:1}});
  },
  sortableOpts: function() {
    return {
      draggable:'.block',
      handle: '.panel-heading',
      group: 'column',
      collection: 'Blocks',
      selectField: 'columnID',
      selectValue: this._id
    }
  },
  empty: function() {
    var selector = {columnID:this._id};
    if (Session.get('editedWall') != this.wallID) //if not editing
      selector.visible = true //show only visible blocks
    var blocks = Blocks.find(selector,{sort: {order:1}}).fetch();
    return (this.visible && (blocks.length > 0)) ? '' : 'empty';
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
  yellow: function() {
    return (this.visible) ? 'yellow' : '';
  },
  columnVisible: function() {
    return (this.visible) ? 'columnVisible' : 'columnHidden';
  }
});

Template.column.events({
  'click .addTextBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'text',
      title: '',
      text: ''
    }
    Meteor.call('insertBlock',block);
  },
  'click .addImageBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'image',
      title: '',
      image: ''
    }
    Meteor.call('insertBlock',block);
  },
  'click .addEmbedBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'embed',
      title: '',
      embedCode: ''
    }
    Meteor.call('insertBlock',block);
  },
  'click .addFileBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'file',
      title: '',
      files: []
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
  },
  'click .columnVisible' : function(event,tmpl) {
    Meteor.call('hideColumn',tmpl.data._id);
  },
  'click .columnHidden' : function(event,tmpl) {
    Meteor.call('showColumn',tmpl.data._id);
  }
});