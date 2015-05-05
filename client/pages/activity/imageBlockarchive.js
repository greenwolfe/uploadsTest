// /client/column.js

/*
,
  'click .addImageBlock': function(event,tmpl) {
    var block = {
      columnID: tmpl.data._id,
      type: 'image',
      title: ''
    }
    Meteor.call('insertBlock',block);
  }

*/

// /client/block.js

  /**********************/
 /**** IMAGEBLOCK ******/
/**********************/

/*
Template.imageBlock.helpers({
  imageFile: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.findOne(selector,{sort: {order:1}});
  },
  inEditedWall: inEditedWall,
  summernoteOptions: summernoteOptions,
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        console.log(file);
        var fileId = Meteor.call('insertFile',file);
      },
      validate: function(files) {
        var valid = true;
        files.forEach(function(file) {
          if ((file.size > 1e8) || (file.type.indexOf('image') < 0))
            valid = false;
        });
        return valid;
      }
    }
  }
});*/

  /*****************************/
 /**** delete Image File ******/
/*****************************/
/*
Template.deleteImageButton.events({
  'click .deleteImageFile': function(event,tmpl) {
    if (confirm('if this is the last link to this image, \nthe image file itself will also be deleted.  \nAre you sure you want to delete this link?'))
      Meteor.call('deleteFile', this._id);
  }
});
*/

// /collection/blocks.js
// add 'image' to validTypes

