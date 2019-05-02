$(document).ready(function () {

	//config
	var cssFolder = 'css/';
	var titleRole = 'Роль';
	var titleName = 'Игрок';
	var classHeader = 'sHeader';
	var classMaff = 'roleMaff';
	var classDie = 'gamerDie';
	var classBtnSelected = 'btnSelected';
	var waitTimerDefault = 0; // Таймер на три минуты
	// Роли, используемые в игре
	// Роли нельзя менять местами, так как механизм скрипта завязан на идентификаторы.
	// Названия ролей менять можно
	var arRoles = Array();
	arRoles[1] = '&nbsp;'; // Мирный, обыватель
	arRoles[2] = 'Мафия';
	arRoles[3] = 'Босс';
	arRoles[4] = 'Комиссар';
	arRoles[5] = 'Доктор';
	arRoles[6] = 'Красотка';
	arRoles[7] = 'Маньяк';
	arRoles[8] = 'Бессмертный';
	arRoles[9] = 'Вор';
	arRoles[10] = 'Смертник';
	// Список ролей
	var select = '<select>';
	for (var i = 1; i < arRoles.length; i++) select = select + '<option value="' + i + '">' + arRoles[i] + '</option>';
	select = select + '</select>';
	// Названия кнопок и отметок в протоколе
	// Нельзя указывать html-формат символов типа &#8258; - надо указывать сам символ!
	// Коды можно глянуть тут, например: http://an-site.ru/utf.htm
	var arBtnTitles = Array();
	arBtnTitles[1] = "X"; // для убийства
	arBtnTitles[2] = "В"; // для вора
	arBtnTitles[3] = "✚"; // для лечения
	arBtnTitles[4] = "✍"; // для проверки комиссаром
	arBtnTitles[5] = "❤"; // для спасения красоткой
	arBtnTitles[6] = "М"; // для обработки маньяком
	arBtnTitles[7] = "✕"; // для убийства днём
	arBtnTitles[8] = "*"; // для взрыва смертника
	// ➌
	// Краткое описание ролей
	s = 'Обозначения:<br /><strong>' + arBtnTitles[1] + '</strong> - Убийство мафией<br /><strong>' + arBtnTitles[2] + '</strong> - Вор крадёт способность<br /><strong>' +
		arBtnTitles[3] + '</strong> -  Доктор лечит<br /><strong>' + arBtnTitles[4] + '</strong> - Комиссар проверяет<br />' +
		arBtnTitles[5] + '</strong> - Красотка спасает<br /><strong>' + arBtnTitles[6] + '</strong> - Маньяк действует<br />' +
		arBtnTitles[7] + '</strong> - расстрел днём<br /><strong>' + arBtnTitles[8] + '</strong> - взрыв смертника';
	$('#dInfoSigns').html(s);

	//config end

	$("#tabs").tabs();
	var br = "<br>",
		btnNight = '<input id="btnNight" type="button" onclick="RoundAdd(1)" value="Ночь">',
		btnDay = '<input id="btnDay" type="button" onclick="RoundAdd(2)" value="День" disabled>',
		btnClear = '<input id="btnClear" type="button" onclick="Action(0= 0 = 0,0)" value="Сбросить действия">',
		btnTimer = '<input id="btnTimer" type="button" onclick="StartTimer()" value="Таймер">',
		timerID = 0,
		rows = 0,
		gamers = 0,
		maffCnt = 0,
		idImmortal = 0,
		idMedic = 0,
		idBeauty = 0,
		idDetective = 0,
		idManiac = 0,
		idThief = 0,
		idBoss = 0,
		idMaff = 0,
		maffCnt = 0,
		idBomber = 0,
		inGame = false;

	$('#btnGamerAdd').click(function () {
		rows++;
		gamers++;
		var btnDel = '<input type="button" onclick="GamerDel(' + rows + ');" value="-" />'
		var btnUp = '<input type="button" class="btnsmall" value="▲" onclick="GamerUp(' + rows + ');" />';
		var btnDown = '<input type="button" class="btnsmall" value="▼" onclick="GamerDown(' + rows + ');" />';
		$('#dNums').append('<span id="sNum' + rows + '"><span class="sDigit">' + rows + '</span><span class="sBtn">' + btnDel + '</span><span class="sBtn">' + btnUp + btnDown + '</span></span>');
		val = '';
		$('#dNames').append('<span id="sName' + rows + '"><input type="text" value="' + val + '"/></span>');
		$('#dRoles').append('<span id="sRole' + rows + '">' + select + '</span>');
		renum();
		showInfo();
	});

	$('#btnSpreadRoles').click(function () {
		var arSpread = Array();
		// Стабильно добавляем две Мафии, Доктора и Комиссара
		arSpread.push(arRoles[2]);
		arSpread.push(arRoles[2]);
		arSpread.push(arRoles[4]);
		arSpread.push(arRoles[5]);

		
		// Очистка всех ролей, которые были ранее назначены
		$('#dRoles').find('select').val("");
		// Собираем id span'ов, коорые у нас есть в столбце ролей, чтобы назначить случайно роли
		var arSpan = Array();
		$.each($('#dRoles').find('select'), function () {
			arSpan.push($(this).parent().attr('id'));
		});
		// Прогоняем цикл по подобранным ролям, чтобы назначить их случайным игрокам
		for (i = 0; i < arSpread.length; i++) {
			// Выбираем номер случайного игрока
			var n = Math.floor(Math.random() * arSpan.length);
			// Проверяем, что этому игроку не назначена уже роль, если назначена, то выбираем номер снова
			while (arRoles[1] != $('#' + arSpan[n]).find("option:selected").html()) n = Math.floor(Math.random() * arSpan.length);
			// Назначаем очереную роль выбранному игроку
			$('#' + arSpan[n]).find('select :contains("' + arSpread[i] + '")').attr("selected", "selected");
		}
	});

	function showInfo() {
		$('#cover').height((gamers * 26 + 27) + "px")
		info = 'Игроков: ' + gamers;
		info = info + '&nbsp; Мафии: ' + maffCnt;
		if (4 < gamers && !inGame) {
			$('#btnBegin').removeAttr("disabled");
			$('#btnSpreadRoles').removeAttr("disabled");
		} else {
			$('#btnBegin').attr("disabled", "disabled");
			$('#btnSpreadRoles').attr("disabled", "disabled");
		}
		$('#dInfo').html(info);
	}

	function renum() {
		n = 1;
		$('#dNums').find('.sDigit').each(function () {
			$(this).html(n++);
		});
	}
});