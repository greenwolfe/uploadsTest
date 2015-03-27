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
  sortableOpts: function() {
    return {
      draggable:'.block',
      handle: '.panel-heading',
      group: 'column',
      columnID: this._id,
      onRemove: function() {

      },
      onAdd: function() {

      }
      /*onEnd: function(evt) {
        console.log('on end of dragging');
        console.log(evt);
        var block = Blaze.getData(evt.item)
        console.log('item - ')
        console.log(block);
        var column = Blaze.getData(evt.from)
        console.log('column -')
        console.log(column);
        if (item.columnID != from._id) Meteor.call('updateBlock',{
          _id:block._id,
          columnID:from._id
        });
      }*/
    };
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
  }
});

/*Template.column.onRendered(function() {
  var el = this.find('.column');
  if (!el) return;
  Sortable.create(el,{
    draggable:'.block',
    handle: '.panel-heading',
    group: 'column',
    onEnd: function(evt) {
      console.log('on end of dragging');
      console.log(evt);
      var block = Blaze.getData(evt.item)
      console.log('item - ')
      console.log(block);
      var column = Blaze.getData(evt.from)
      console.log('column -')
      console.log(column);
      var next = $(evt.item).next().get(0);
      console.log('next - ');
      console.log(next)
      if (next) next = Blaze.getData(next);
      console.log(next); 
      console.log('previous - ');
      var previous = $(evt.item).prev().get(0);
      console.log(previous);
      if (previous) previous = Blaze.getData(previous);
      console.log(previous);     
    }
  });
});*/