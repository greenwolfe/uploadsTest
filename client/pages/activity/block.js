//make some blocks that are group or section editable?
//add button bar with copy block ... add to an array so cold
//copy several blocks and then paste them into another column
  /**********************/
 /******* HELPERS ******/
/**********************/
var enabledState = function() {
  return (Session.get('editedWall') != Template.parentData().wallID) ? 'disabled' : 'enabled';
}
var inEditedWall = function(gen) {
  gen = gen || 1;
  return (Session.get('editedWall') == Template.parentData(gen).wallID);
}
var validateFiles = function(files) {
  return (_.max(_.pluck(files,'size')) < 1e8);  //100MB
}
//to use:  genericCallbacks: {validate: validateFiles},

  /**********************/
 /******* BLOCK** ******/
/**********************/

Template.block.helpers({
  blockType: function() {
    return Template[this.type + 'Block'];
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
  fileCount: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector).count();
  },
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  },
  'click .copyBlock': function(event,tmpl) {
    if (!event.ctrlKey) { //clear the clipboard
      ClipboardBlocks.find().forEach(function(block) {
        ClipboardBlocks.remove(block._id);
      });
    } //else do nothing ... add block to clipboard
    var block = this;
    block.idFromCopiedBlock = block._id;
    block.order = ClipboardBlocks.find().count() + 1;
    delete block._id;
    delete block.columnID;
    ClipboardBlocks.insert(block);
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
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.findOne(selector,{sort: {order:1}});
  },
  inEditedWall: inEditedWall,
  enabledState: enabledState,
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
});

  /*****************************/
 /**** delete Image File ******/
/*****************************/

Template.deleteImageButton.events({
  'click .deleteImageFile': function(event,tmpl) {
    if (confirm('Are you sure you want to delete this image?'))
      Meteor.call('deleteFile', this._id);
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
  files: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector,{sort: {order:1}});
  },
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        var fileId = Meteor.call('insertFile',file);
      },
      validate: validateFiles
    }
  },
  sortableOpts: function() {
    return {
      draggable:'.file',
      handle: '.moveFile',
      collection: 'Files',
      selectField: 'blockID',
      selectValue: this._id
    }
  }
});

//add a show/hide button for individual files
Template.fileLink.helpers({
  inEditedWall: inEditedWall
});

Template.fileLink.events({
  'click .deleteFile':function(event,template) {
    if (confirm('Are you sure you want to delete this file?')) {
      Meteor.call('deleteFile', this._id);
      //check this to see if imageFile is there in this
      //make sure deleteFile does re-ordering (not necessary for image)
    }
  }
})
