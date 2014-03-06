$(document).ready(function () {

  chrome.storage.local.get(function (degerler) {

  $('#sekmeler').tabs();
  //$(document).tooltip();

  $("#kapsayici").submit(function (e) {
    e.preventDefault();
  });

  function tarihGAY(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var dmy = '' + (d<= 9 ? '0' + d : d) + '.' + (m<=9 ? '0' + m : m) + '.' + y;
    return dmy;
  }

  function msgBox(baslik, mesaj, simge, butonlar) {

    var dialogDiv = document.createElement('div');
    dialogDiv.style.display = 'none';
    dialogDiv.id = 'popup';
    dialogDiv.title = baslik;

    var dialogP = document.createElement('p');
    var dialogIcon = document.createElement('span');
    dialogIcon.className = "ui-icon ui-icon-" + simge;
    dialogIcon.style.cssText = "float:left; margin:0 7px 20px 0;";
    
    var dialogMesaj = document.createTextNode(mesaj);

    dialogP.appendChild(dialogIcon);
    dialogP.appendChild(dialogMesaj);
    dialogDiv.appendChild(dialogP);
    document.body.appendChild(dialogDiv);

    $("#popup").dialog({
      resizable: false,
      modal: true,
      buttons: butonlar,
      close: function () {
        $(this).dialog('destroy').remove();
      }
    });
  }

  function ogretim_turu_degistir (ogretim_turu) {

    if (ogretim_turu == 'ikili')
      ikili_ogretim_alani.style.display = 'inline';
    else
      ikili_ogretim_alani.style.display = 'none';

    nobet_tablosu.innerHTML = '';

    var kategoriler = nobet_kategorileri.value.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',').split(',');
    var gunler = ['', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA'];
    var bugun = new Date();

    if(kategoriler.length > 0) {
      var ilksatirTr = document.createElement('tr');
      ilksatirTr.appendChild(document.createElement('td'));

      for (var kategori in kategoriler) {
        var ilksatirTd = document.createElement('td');
        ilksatirTd.innerText = kategoriler[kategori];
        ilksatirTr.appendChild(ilksatirTd);
      }

      nobet_tablosu.appendChild(ilksatirTr);
      
      for (var gun = 1; gun <= 5; gun++) {
        var tarih = new Date(bugun.setDate(bugun.getDate() - bugun.getDay()+gun));
        var trx = document.createElement('tr');
        var td1 = document.createElement('td');
        td1.style.width = '8%';
        td1.style.textAlign = 'center';
        td1.innerHTML = tarihGAY(tarih)+'<br />'+gunler[gun];
        trx.appendChild(td1);

        for (var kategori in kategoriler) {

          var tdx = document.createElement('td');

          if (ogretim_turu == 'ikili') {
            
            var txtNobetci1 = document.createElement('input');
            txtNobetci1.type = 'text';
            txtNobetci1.id = 'nobetliste_g'+gun+'_sabah_k'+kategori;
            txtNobetci1.name = txtNobetci1.id;
            txtNobetci1.placeholder = 'sabah nöb.';
            txtNobetci1.value = degerler[txtNobetci1.id] == undefined ? '' : degerler[txtNobetci1.id];
            tdx.appendChild(txtNobetci1);

            tdx.appendChild(document.createElement('br'));

            var txtNobetci2 = document.createElement('input');
            txtNobetci2.type = 'text';
            txtNobetci2.id = 'nobetliste_g'+gun+'_oglen_k'+kategori;
            txtNobetci2.name = txtNobetci2.id;
            txtNobetci2.placeholder = 'öğlen nöb.';
            txtNobetci2.value = degerler[txtNobetci2.id] == undefined ? '' : degerler[txtNobetci2.id];
            tdx.appendChild(txtNobetci2);
          }
          else {
            var txtNobetci = document.createElement('input');
            txtNobetci.type = 'text';
            txtNobetci.id = 'nobetliste_g'+gun+'_tamgn_k'+kategori;
            txtNobetci.name = txtNobetci.id;
            txtNobetci.value = degerler[txtNobetci.id] == undefined ? '' : degerler[txtNobetci.id];
            tdx.appendChild(txtNobetci);
          }

          trx.appendChild(tdx);
        }
        nobet_tablosu.appendChild(trx);
      }
    }
  }

  function ders_saati (devre, no, ogretim_turu) {
    var group = document.createElement('fieldset');
    var grouplegend = document.createElement('legend');
    var baslangic_saati = document.createElement('input');
    var bitis_saati = document.createElement('input');
    var br = document.createElement('br');

    if (ogretim_turu == 'ikili') {
      var kisaltma = (devre == 'oglen') ? 'Öğl' : 'Sab';
      grouplegend.innerText = kisaltma + ' ' + no + '. ders';
    }
    else {
      grouplegend.innerText = no + '. ders';
    }

    baslangic_saati.type = 'time';
    baslangic_saati.required = 'required';
    baslangic_saati.id = 'derssaati_'+ devre +'_'+("00"+no).slice(-2)+'_basla';
    baslangic_saati.name = baslangic_saati.id;
    baslangic_saati.title = 'Başlangıç saati';
    baslangic_saati.value = degerler[baslangic_saati.id] == undefined ? '' : degerler[baslangic_saati.id];

    bitis_saati.type = 'time';
    bitis_saati.required = 'required';
    bitis_saati.id = 'derssaati_'+ devre +'_'+("00"+no).slice(-2)+'_bitis';
    bitis_saati.name = bitis_saati.id;
    bitis_saati.title = 'Bitiş saati';
    bitis_saati.value = degerler[bitis_saati.id] == undefined ? '' : degerler[bitis_saati.id];

    group.appendChild(grouplegend);
    group.appendChild(baslangic_saati);
    group.appendChild(br);
    group.appendChild(bitis_saati);

    return group;
  }

  function ders_saatleri_olustur (ogretim_turu) {
    sabah_dersleri.innerHTML = "";
    oglen_dersleri.innerHTML = "";

    for (var a = 1; a <= gunluk_ders_sayisi.value; a++) {
      sabah_dersleri.appendChild(ders_saati('sabah', a, ogretim_turu));
      if (ogretim_turu == 'ikili') {
        oglen_dersleri.appendChild(ders_saati('oglen', a, ogretim_turu));
      }
    }
  }

  function ders_programi (ogretim_turu) {
    
    siniflar_listbox.innerHTML = '';
    ders_prog_kapsayici.innerHTML = '';

    var gunler = ['PAZ', 'PZT', 'SAL', 'ÇRŞ', 'PRŞ', 'CUM', 'CMT'];
    var siniflardizi = siniflar.value.split(',');

    ders_saatleri_olustur(ogretim_turu);

    for (var sinif in siniflardizi) {

      var optsiniflar = document.createElement('option');
      optsiniflar.value = siniflardizi[sinif];
      optsiniflar.innerText = siniflardizi[sinif];
      siniflar_listbox.appendChild(optsiniflar);

      var dersprogtablo = document.createElement('table');
      dersprogtablo.id = siniflardizi[sinif]+'_ders_prog_tablosu';
      dersprogtablo.style.textAlign = 'center';
      dersprogtablo.style.display = 'none';

      var dersprogtbody = document.createElement('tbody');

      var satir0 = document.createElement('tr');
      var satir0td = document.createElement('td');
      satir0td.style.textAlign = 'left';
      satir0td.setAttribute('colspan', gunluk_ders_sayisi.value+1);
      satir0td.appendChild(document.createTextNode(siniflardizi[sinif] + ' SINIFI DERS PROGRAMI '));
      
      if (ogretim_turu == 'ikili') {
        var oglencisinifcb = document.createElement('input');
        oglencisinifcb.type = 'checkbox';
        oglencisinifcb.name = 'oglencisinifsecim';
        oglencisinifcb.id = siniflardizi[sinif] + '_ders_prog_tablosu_oglenci_cb';
        if (!(degerler[oglencisinifcb.id] == undefined || degerler[oglencisinifcb.id] == false)) {
          oglencisinifcb.setAttribute('checked', true);
        }
        //if (oglencisinifcb.checked)

        var oglencisiniflabel = document.createElement('label');
        oglencisiniflabel.setAttribute("for", siniflardizi[sinif] + '_ders_prog_tablosu_oglenci_cb');
        oglencisiniflabel.innerHTML = "Bu sınıf öğlencidir.";
        satir0td.appendChild(oglencisinifcb);
        satir0td.appendChild(oglencisiniflabel);
      }
      
      satir0.appendChild(satir0td);

      dersprogtbody.appendChild(satir0);

      var satir1 = document.createElement('tr');
      satir1.appendChild(document.createElement('td'));
      for (var i = 1; i <= gunluk_ders_sayisi.value; i++) {
        var satir1td = document.createElement('td');
        satir1td.innerHTML = i + '. ders';
        satir1.appendChild(satir1td);
      }
      
      dersprogtbody.appendChild(satir1);
      for (var gun = 1; gun <= 5; gun++) {
        var gunsatir = document.createElement('tr');
        for (var i = 0; i <= gunluk_ders_sayisi.value; i++) {
          var gunsatirtd = document.createElement('td');
          if (i < 1) {
            gunsatirtd.innerText = gunler[gun];
            gunsatirtd.style.width = '8%';
          }
          else {
            
            var dersinput = document.createElement('input');
            dersinput.type = 'text';
            if (ogretim_turu == 'ikili') {
              if (degerler[oglencisinifcb.id] == undefined || degerler[oglencisinifcb.id] == false) {
                dersinput.id = 'dersprog_'+siniflardizi[sinif]+'_'+gun+'_'+("00"+i).slice(-2)+'_sabah';
              }
              else {
                dersinput.id = 'dersprog_'+siniflardizi[sinif]+'_'+gun+'_'+("00"+i).slice(-2)+'_oglen';
              }
            }
            else {
              dersinput.id = 'dersprog_'+siniflardizi[sinif]+'_'+gun+'_'+("00"+i).slice(-2)+'_sabah';
            }
            dersinput.value = degerler[dersinput.id] == undefined ? '' : degerler[dersinput.id];
            gunsatirtd.appendChild(dersinput);
          }
          gunsatir.appendChild(gunsatirtd);
        }
        dersprogtbody.appendChild(gunsatir);
      }
      dersprogtablo.appendChild(dersprogtbody);
      ders_prog_kapsayici.appendChild(dersprogtablo);
    }

    siniflar_listbox.firstChild.selected = 'selected';
    siniflar_listbox.style.display = 'inline';
    document.getElementById(siniflardizi[0]+'_ders_prog_tablosu').style.removeProperty('display');
  }

  function autosuggest() {
    $.ajax({
      url : encodeURI('http://autocomplete.wunderground.com/aq?query=' + $('input[name="adres"]').val()),
      dataType : "json",
      success : function (response) {
        $('#suggest').empty();
        for (var i in response.RESULTS)
          $('#suggest').append($('<option></option>').val(response.RESULTS[i].name).html(response.RESULTS[i].name));
      }
    });
  }


    $("#ozelmodulhtml").jqte({link: false, unlink: false, titletext:[
        {title:"Metin Biçimi"},
        {title:"Yazı Boyutu"},
        {title:"Renk"},
        {title:"Kalın",hotkey:"B"},
        {title:"İtalik",hotkey:"I"},
        {title:"Altı Çizili",hotkey:"U"},
        {title:"Sıralı Liste",hotkey:"."},
        {title:"Sırasız Liste",hotkey:","},
        {title:"Alt İndis",hotkey:"down arrow"},
        {title:"Üst İndis",hotkey:"up arrow"},
        {title:"Girintiyi Azalt",hotkey:"left arrow"},
        {title:"Girintiyi Arttır",hotkey:"right arrow"},
        {title:"Sola Hizala"},
        {title:"Ortala"},
        {title:"Sağa Hizala"},
        {title:"Üstü Çizili",hotkey:"K"},
        {title:"Köprü Ekle",hotkey:"L"},
        {title:"Köprüyü Kaldır",hotkey:""},
        {title:"Biçimlendirmeyi Temizle",hotkey:"Delete"},
        {title:"Yatay Çizgi",hotkey:"H"},
        {title:"Kaynak Kod",hotkey:""}
    ]}); 
    
    okul_adi.value = degerler.okul_adi;
    duyuru.value = degerler.duyuru;
    nobet_degisim_saati.value = degerler.nobet_degisim_saati;
    kayan_yazi_hizi.value = degerler.kayan_yazi_hizi;
    kayan_yazi_hizi_gosterge.value = degerler.kayan_yazi_hizi;
    slayt_hizi.value = degerler.slayt_hizi;
    slayt_hizi_gosterge.value = degerler.slayt_hizi;
    slayt_cuboid.value = degerler.slayt_cuboid;
    slayt_cuboid_gosterge.value = degerler.slayt_cuboid;
	  sureli_gosterim_hizi.value = degerler.sureli_gosterim_hizi;
    sureli_gosterim_hizi_gosterge.value = degerler.sureli_gosterim_hizi;
    nob_per_punto.value = degerler.nob_per_punto;
    nob_per_punto_gosterge.value = degerler.nob_per_punto;
    ders_prog_punto.value = degerler.ders_prog_punto;
    ders_prog_punto_gosterge.value = degerler.ders_prog_punto;
    apikey.value = degerler.apikey;
    adres.value = degerler.adres;
    ozelmodulbaslik.value = degerler.ozelmodulbaslik;
    nobet_kategorileri.value = degerler.nobet_kategorileri;
    haber_kategorisi.value =degerler.haber_kategorisi;
    gunluk_ders_sayisi.value = degerler.gunluk_ders_sayisi;
    gunluk_ders_sayisi_gosterge.value = degerler.gunluk_ders_sayisi;
    siniflar.value = degerler.siniflar;
    ekranmodu.checked = (degerler.ekranmodu == 'fullscreen');
    $("#ozelmodulhtml").jqteVal(degerler.ozelmodulhtml);

    $('#haber_kategorisi > option[value="'+degerler.haber_kategorisi+'"]').prop('selected', true);
    $('input[type="radio"][name="ogretim_turu"][value="'+degerler.ogretim_turu+'"]').prop('checked', true);
    $('input[type="radio"][name="sag_moduller"][value="'+degerler.sag_moduller+'"]').prop('checked', true);
    $('input[type="radio"][name="sol_moduller"][value="'+degerler.sol_moduller+'"]').prop('checked', true);
    version.innerHTML = "LCD Pano v" + chrome.runtime.getManifest().version;
    yil.innerHTML = new Date().getFullYear();

    $('#nobet_kategorileri').tagsInput({
      'defaultText' : 'ekleyin',
      'height':'60px',
      'width':'98%',
      'onAddTag':function () {
        ogretim_turu_degistir($('input[type="radio"][name="ogretim_turu"]:checked').val());
      },
      'onRemoveTag':function () {
        ogretim_turu_degistir($('input[type="radio"][name="ogretim_turu"]:checked').val());
      }
    });

    $('#siniflar').tagsInput({
      'defaultText' : 'ekleyin',
      'height':'60px',
      'width':'98%',
      'onAddTag':function () {
        ders_programi($('input[type="radio"][name="ogretim_turu"]:checked').val());
      },
      'onRemoveTag':function () {
        ders_programi($('input[type="radio"][name="ogretim_turu"]:checked').val());
      }
    });

    ogretim_turu_degistir(degerler.ogretim_turu);
    ders_programi(degerler.ogretim_turu);

    $('#adres').keyup(function () {
      clearTimeout($.data(this, 'timer'));
      var bekle = setTimeout(autosuggest, 500);
      $(this).data('timer', bekle); 
    });

    $('#gunluk_ders_sayisi').mouseup(function (e) {
      ders_programi($('input[type="radio"][name="ogretim_turu"]:checked').val());
    });

    $('#gunluk_ders_sayisi').change(function () {
      gunluk_ders_sayisi_gosterge.value = $(this).val();
    });

    $('#kayan_yazi_hizi').change(function () {
      kayan_yazi_hizi_gosterge.value = $(this).val();
    });

    $('#slayt_hizi').change(function () {
      slayt_hizi_gosterge.value = $(this).val();
    });

    $('#slayt_cuboid').change(function () {
      slayt_cuboid_gosterge.value = $(this).val();
    });
	
	  $('#sureli_gosterim_hizi').change(function () {
      sureli_gosterim_hizi_gosterge.value = $(this).val();
    });

    $('#nob_per_punto').change(function () {
      nob_per_punto_gosterge.value = $(this).val();
    });

    $('#ders_prog_punto').change(function () {
      ders_prog_punto_gosterge.value = $(this).val();
    });

    $('#ders_prog_kapsayici input[type=checkbox]').change(function () {
      var progtabloinputselector = '#' + $(this).prop('id').slice(0, -11) + ' input[type=text]';
      a = $(this);
      $(progtabloinputselector).each(function () {
        var x = document.getElementById($(this).prop('id'));
        if (a.is(':checked')) {
          x.id = x.id.slice(0, -5) + 'oglen';
        }
        else {
          x.id = x.id.slice(0, -5) + 'sabah';
        }
        console.log($(this).is(':checked'));
      });
    });

    $('#resim_sec').click(function () {
      chrome.mediaGalleries.getMediaFileSystems({ interactive : 'yes' }, function (fs) {});
    });

    $('#yedekle').click(function () {
      chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: 'lcd-pano-yedek.txt', acceptsAllTypes: false, accepts : [{extensions: ['txt']}]}, function(writableFileEntry) {
        writableFileEntry.createWriter(function(writer) {

          writer.onerror = function(e) {
              msgBox('HATA', 'Kaydetme başarısız.', 'circle-close' , {
                'Tamam' : function () {
                  $('#popup').dialog("close");
                }
              });
          };
          writer.onwriteend = function(e) {
            msgBox('BİLGİ', 'Ayarlar yedeklendi.', 'check' , {
                'Tamam' : function () {
                  $('#popup').dialog("close");
                }
              });
          };

          writer.write(new Blob([JSON.stringify(degerler)], {type: 'text/plain'}));  
        });
      });
    });

    $('#geri_yukle').click(function () {
      chrome.fileSystem.chooseEntry({type: 'openFile', acceptsAllTypes: false, accepts : [{extensions: ['txt']}]}, function(readOnlyEntry) {
        readOnlyEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = function(e) {
            msgBox('HATA', 'Yedek geri yüklenemedi. Dosya açılamıyor.', 'circle-close' , {
                'Tamam' : function () {
                  $('#popup').dialog( "close" );
                }
            });
        };
        reader.onloadend = function(e) {

          try {
            var yedek = JSON.parse(e.target.result);
            if (!yedek.version || yedek.version == undefined || yedek.version == '') {
              msgBox('HATA', 'Yedek geri yüklenemedi. Geçersiz dosya.', 'circle-close' , {
                'Tamam' : function () {
                  $('#popup').dialog( "close" );
                }
              });
            }
            else if(yedek.version > chrome.runtime.getManifest().version) {
              msgBox('HATA', 'Bu yedek dosyası daha yeni bir sürüme ait. Lütfen uygulamayı güncelleyiniz.', 'alert', {
                "Tamam": function() {
                  $('#popup').dialog( "close" );
                }
              });
            }
            else if(yedek.version == chrome.runtime.getManifest().version) {
              chrome.storage.local.clear(function () {
                chrome.storage.local.set(yedek, function () {
                  chrome.runtime.sendMessage('restart');
                });
              });
            }
            else if (yedek.version < chrome.runtime.getManifest().version) {
              msgBox('UYARI', 'Bu yedek dosyası daha eski bir sürüme ait. Uygulama doğru çalışmayabilir. Devam etmek istiyor musunuz?', 'alert', {
                "Evet": function() {
                  chrome.storage.local.clear(function () {
                    chrome.storage.local.set(yedek, function () {
                      chrome.runtime.sendMessage('restart');
                    });
                  });
                },
                "İptal": function() {
                  $('#popup').dialog( "close" );
                }
              });
            }
            else {
              msgBox('HATA', 'Yedek geri yüklenemedi. Geçersiz dosya.', 'circle-close' , {
                'Tamam' : function () {
                  $('#popup').dialog( "close" );
                }
              });
            }
          }
          catch (e) {
            msgBox('HATA', 'Yedek geri yüklenemedi. Geçersiz dosya.', 'circle-close' , {
                'Tamam' : function () {
                  $('#popup').dialog( "close" );
                }
            });
          }
        };
        reader.readAsText(file);
      });
    });
  });


    $('#siniflar_listbox').change(function () {
      $('#ders_prog_kapsayici').children().hide();
      //$('#'+$(this).val()+'_ders_prog_tablosu').show();
      document.getElementById($(this).val()+'_ders_prog_tablosu').style.display = 'inline';
    });

    $('input[type="radio"][name="ogretim_turu"]').change(function () {
      if ($(this).val() == 'ikili') {
        $('#ikili_ogretim_alani').show();
        ders_programi($(this).val());
        ogretim_turu_degistir($(this).val());
      }
      else {
        $('#ikili_ogretim_alani').hide();
        ders_programi($(this).val());
        ogretim_turu_degistir($(this).val());
      }
    });

    $('#kaydet').click(function () {

      if (kapsayici.checkValidity() == false) {
        $("#sekmeler").tabs("option", "active", 2);
        msgBox('UYARI', 'Lütfen ders giriş-çıkış saatlerini eksiksiz doldurunuz.', 'alert' , {
                'Tamam' : function () {
                  $('#popup').dialog("close");
                }
              });
        return false;
      }
      else {

      var kayitdizisi = {
        'version': chrome.runtime.getManifest().version,
        'okul_adi': okul_adi.value,
        'duyuru': duyuru.value,
        'kayan_yazi_hizi': kayan_yazi_hizi.value,
        'nob_per_punto': nob_per_punto.value,
        'ders_prog_punto' : ders_prog_punto.value,
        'apikey': apikey.value,
        'adres': adres.value,
        'slayt_hizi': slayt_hizi.value,
        'slayt_cuboid': slayt_cuboid.value,
		    'sureli_gosterim_hizi': sureli_gosterim_hizi.value,
        'haber_kategorisi': haber_kategorisi.value,
        'nobet_kategorileri': nobet_kategorileri.value,
        'gunluk_ders_sayisi': gunluk_ders_sayisi.value,
        'ekranmodu': (ekranmodu.checked) ? 'fullscreen' : 'normal',
        'ozelmodulhtml' : $(".jqte_editor").html(),
        'ozelmodulbaslik' : ozelmodulbaslik.value,
        'siniflar': siniflar.value,
        'nobet_degisim_saati': nobet_degisim_saati.value,
        'ogretim_turu' : $('input[type="radio"][name="ogretim_turu"]:checked').val(),
        'sag_moduller' : $('input[type="radio"][name="sag_moduller"]:checked').val(),
        'sol_moduller' : $('input[type="radio"][name="sol_moduller"]:checked').val()
      };

      $("#nobet_tablosu input").each(function () {
        kayitdizisi[$(this).prop('id')] = $(this).val();
      });

      $("#ders_prog_kapsayici input[type=text]").each(function () {
        kayitdizisi[$(this).prop('id')] = $(this).val();
      });

      $("#ders_prog_kapsayici input:checkbox").each(function () {
        kayitdizisi[$(this).prop('id')] = $(this).prop('checked');
      });

      $("#ders_saatleri input").each(function () {
        kayitdizisi[$(this).prop('id')] = $(this).val();
      });

      var ders_saatleri = { 'sabah': {}, 'oglen': {} };

      $("#ders_saatleri input").each(function () {
        var sabahoglen = $(this).prop('id').split('_')[1];
        var dersno = $(this).prop('id').split('_')[2];
        var baslabitis = $(this).prop('id').split('_')[3]+'_saati';

        if (!ders_saatleri[sabahoglen][dersno])
          ders_saatleri[sabahoglen][dersno] = {};
        ders_saatleri[sabahoglen][dersno][baslabitis] = $(this).val();
      });

      var ders_programi = {
        'pzt': { 'sabah' : {}, 'oglen': {} },
        'sal': { 'sabah' : {}, 'oglen': {} },
        'crs': { 'sabah' : {}, 'oglen': {} },
        'per': { 'sabah' : {}, 'oglen': {} },
        'cum': { 'sabah' : {}, 'oglen': {} },
      };

      $("#ders_prog_kapsayici input[type=text]").each(function () {
        if ($(this).prop('id').slice(-2) == 'cb') {
          kayitdizisi[$(this).prop('id')] = $(this).prop('checked');
        }
        else {
          var gunler = ['','pzt','sal','crs','per','cum'];
          var sinif = $(this).prop('id').split('_')[1];
          var gun = gunler[$(this).prop('id').split('_')[2]];
          var dersno = $(this).prop('id').split('_')[3];
          var sabahoglen = $(this).prop('id').split('_')[4];
  
          if (!ders_programi[gun][sabahoglen][dersno])
            ders_programi[gun][sabahoglen][dersno] = {};
          ders_programi[gun][sabahoglen][dersno][sinif] = $(this).val();
        }
      });

      kayitdizisi['ders_saatleri'] = ders_saatleri;
      kayitdizisi['ders_programi'] = ders_programi;

      chrome.storage.local.clear(function () {
        chrome.storage.local.set(kayitdizisi, function () {
          chrome.runtime.sendMessage('restart', function (response) {
            chrome.storage.local.get(function (degerler) {
            if (response.result == 'closed') {
              chrome.app.window.create('pano.html', {
                bounds: { width: 1200, height: 675 },
                minWidth: 1200, minHeight: 675, frame: 'none', state: degerler.ekranmodu
              }, function () {
                chrome.app.window.current().close();
              });
            }
            });
          });
        });
      });
    }
    });
  });
});


