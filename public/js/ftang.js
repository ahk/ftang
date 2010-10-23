// documentation for this version of jplayer: http://www.happyworm.com/jquery/jplayer/0.2.5/developer-guide.htm
$(function() {
// page loady one time stuff, lots of default event handling

  function loadArtists() {
    $.get( '/artists', function(data) {
      $('#content').html(data);
      $('#tiles ul').listnav({showCounts: false});
    });
  }
  
  function appendPlaylistAddButtons(cover) {
    $('#content .add_album_to_playlist').remove();
    $('#content .view_songs_in_album').remove();
    $(cover).append($('#add_album_to_playlist').html());
  }

  function createAlbumMouseoverTriggers() {
    $('.album').mouseover(function(){
      appendPlaylistAddButtons(this);
      resetCoverMouseoverTriggers(this);
    });
  }

  function resetCoverMouseoverTriggers(cover) {
    $('.album').unbind();
    createAlbumMouseoverTriggers();
    $(cover).unbind();
  }
  
  $('#playlist_list li').live("mouseover", function() {
      if (FTANGPlayer.playItem != $(this).data("index")) {
        $(this).addClass("playlist_hover");
      }
    }
  );
  
  $('#playlist_list li').live("mouseout", function() {
      $(this).removeClass("playlist_hover");
    }
  );
  
  $('#playlist_list li').live("click", function() {
    var index = $(this).data("index");
  	FTANGPlayer.playListChange(index);
  });
  
  $(".playlist_remove").live("click", function(e) {
    var index = $(this).parent().data("index");
    FTANGPlayer.playListRemove(index);
    return false;
  });
  
  $(".add_album_to_playlist").live("click", function(e) {
    var cover = $(this).parents().filter(':first');
    var img = $(cover).find('img');
    var album = $(img).attr('album');
    var artist = $(img).attr('artist');
    $.get('/playlist/add/' + artist + '/' + album, function() {
      // don't reload the file in the player if we already have some
      reloadFile = playlist.length ? false : true;
      FTANGPlayer.loadPlaylist(reloadFile);
      FTANGPlayer.showPlayList();
    });
  });

  $(".tiles a").live("click", function(e) {
    $("#content").html($('#loading').html());
    e.preventDefault();
    var artist = $.trim($(this).text());
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_artist').show();
      $('#header_artist h1').text(artist);
      createAlbumMouseoverTriggers();
    });
  });

  $(".home_nav").live("click", function() {
    $("#content").html($('#loading').html());
    loadArtists();
    $('#header_artist h1').text("");
    $('#header_artist').hide();
    $('#header_album h1').text("");
    $('#header_album').hide();
  });
  
  $('#clear_playlist').live('click', function(e) {
    FTANGPlayer.clearPlaylist();
  });
  
  $('#playlist_list ul li').live("mouseover", function() {
    $(this).find("span.playlist_remove").show();
  });
  
  $('#playlist_list ul li').live("mouseout", function() {
    $(this).find("span.playlist_remove").hide();
  });
  
  $('#toggle_playlist').live('click', function() {
    FTANGPlayer.togglePlaylistVisibility();
  });

  $("#ctrl_prev").live('click', function() {
    FTANGPlayer.broadcastAndCommand('playListPrev');
   	return false;
  });

  $("#ctrl_next").live('click', function() {
  	FTANGPlayer.broadcastAndCommand('playListNext');
    return false;
  });
  
  FTANGPlayer.initJPlayer();
  FTANGPlayer.hidePlaylist();
  // Try to make it feel snappier ...
  setTimeout(function(){
    loadArtists();
  },0);

});
