//make some blocks that are group or section editable?
//add button bar with copy block ... add to an array so cold
//copy several blocks and then paste them into another column
  /**********************/
 /******* HELPERS ******/
/**********************/
var enabledState = function() {
  return (Session.get('editedWall') != Template.parentData().wallID) ? 'disabled' : 'enabled';
}
var inEditedWall = function() {
  return (Session.get('editedWall') == Template.parentData().wallID);
}
var validateFiles = function(files) {
  return (_.max(_.pluck(files,'size')) < 1e8);  
}
//genericCallbacks: {validate: validateFiles},

  /**********************/
 /******* BLOCK** ******/
/**********************/

Template.block.helpers({
  blockType: function() {
    return Template[this.type + 'Block'];
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  noFiles: function() {
    var noImage = !((this.type == 'image') && ('image' in this) && this.image);
    var noFiles = !((this.type == 'file') && ('files' in this) && (this.files.length > 0));
    return noImage && noFiles;
  },
  yellow: function() {
    return (this.visible) ? 'yellow' : '';
  },
  blockVisible: function() {
    return (this.visible) ? 'blockVisible' : 'blockHidden';
  }
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  },
  'click .blockVisible' : function(event,tmpl) {
    Meteor.call('hideBlock',tmpl.data._id);
  },
  'click .blockHidden' : function(event,tmpl) {
    Meteor.call('showBlock',tmpl.data._id);
  }
});

  /**********************/
 /***** TEXTBLOCK ******/
/**********************/

Template.textBlock.helpers({
  enabledState: enabledState
});

  /**********************/
 /**** EMBEDBLOCK ******/
/**********************/

Template.embedBlock.helpers({
  enabledState: enabledState,
  inEditedWall: inEditedWall,
  embedCodeWithNoScript: function() {
    if (!this.embedCode) return false;
    if (_.str.include(this.embedCode,'<script')) {
      return 'This embed code contains javascript and has been blocked because some embedded javascript makes the site hang up.  If you are trying to aggregate and poste rss, atom or twitter feeds, use the feed block.';
    } else {
      return this.embedCode;
    }
  }
});

/* to embed javascript ... currently disabled as
some javascript seems to hang the site, even
when loaded after rendering as below
Template.embedBlock.onRendered(function() {
  if (!this.data.embedCode) return;
  if (_.str.include(this.data.embedCode,'<script')) {
    var el = this.firstNode.parentElement;
    //$(el).prepend(this.data.embedCode);
  }
});*/

  /**********************/
 /**** IMAGEBLOCK ******/
/**********************/

Template.imageBlock.helpers({
  imageFile: function() {
    return Files.findOne(this.image);
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        var fileId = Meteor.call('insertFile',file,function(error,fileID) {
          Meteor.call('updateBlock',{_id:blockID,image: fileID})
        });
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
});

Template.imageBlock.events({
  'click .deleteImageFile': function(event,tmpl) {
    if (confirm('Are you sure you want to delete this image?')) {
      Meteor.call('deleteFile', this.image);
      Meteor.call('updateBlock',{_id:this._id,image: null})
    }
  }
});

  /**********************/
 /**** FILEBLOCK *******/
/**********************/

/* Make the list sortable??? */
/* to do that, change the organization
instead of an array of fileIds in the block,
have a blockID and order field with each file
then use sortable1c with the list of files
no need for add file and remove file methods in collections/blocks.js,
but files will need an add and remove operation that adjusts the list
same with images?
*/
Template.fileBlock.helpers({
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        var fileId = Meteor.call('insertFile',file,function(error,fileID) {
          Meteor.call('blockAddFile',blockID,fileID)
        });
      },
      validate: validateFiles
    }
  }
});

Template.fileLink.helpers({
  inEditedWall: function() {
    return (Session.get('editedWall') == Template.parentData(2).wallID);
  },
  file: function() {
    return Files.findOne(this._id);
  }
});

Template.fileLink.events({
  'click .deleteFile':function(event,template) {
    if (confirm('Are you sure you want to delete this file?')) {
      var parentData = Template.parentData();
      var fileID = this._id;
      Meteor.call('blockRemoveFile',parentData._id,fileID)
      Meteor.call('deleteFile', fileID);
    }
  }
})
