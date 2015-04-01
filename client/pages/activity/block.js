//make some blocks that are group or section editable?

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
/* Make the list sortable??? */
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
  }
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
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
  inEditedWall: inEditedWall
});

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
