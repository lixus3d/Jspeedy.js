
	var jspeedyCore = {

		/**
		 * Get a new jSpeedy object from an element or an element array
		 * @param  Node context A DOM element
		 * @param  mixed element The DOM element you want to get as a jspeedy object or an array of DOM element for a jspeedyCollection object
		 * @return mixed
		 */
		getNew: function(context, element){
			if(element instanceof Array){
				return new jspeedyCollection(element, this);
			}else if( element ) {
				return new jspeedyUnique(element, this);
			}else{
				return new jspeedyEmpty(this);
			}
		},

		/**
		 * Create a jspeedy element from html
		 * @param  Node context A DOM element
		 * @param  string html  The html of the element to create
		 * @return jspeedyUnique
		 */
		createFromHTML: function(context, html){
			// pure js to speed up the most
			var tmpContext = document.createElement('div');
			tmpContext.insertAdjacentHTML('beforeend',html);
			return new jspeedyUnique( tmpContext.lastChild, this);
		},

		/**
		 * Return the jquery version of this jspeedy object
		 * @param  Node context A DOM element
		 * @return jQuery
		 */
		$: function(context){
			if( !this._$jqueryVersion){
				this._$jqueryVersion = jQuery(context);
			}
			return this._$jqueryVersion;
		},

		/**
		 * Force redraw of an element
		 * @param  Node context A DOM element
		 * @return this
		 */
		forceDraw: function(context){
			var o = window.getComputedStyle(context).opacity;
			return this;
		},

		/**
		 * Select a descendant by its id , usually to call directly on the $$
		 * @param  Node context A DOM element
		 * @param  string id The name/id of the element you want
		 * @return jspeedyUnique
		 */
		byId: function(context, id){
			var item;
			if( (item = document.getElementById(id)) ){
				return new jspeedyUnique( item , this );
			}
			return new jspeedyEmpty(this);
		},

		/**
		 * Select descendants by their class
		 * @param  Node context A DOM element
		 * @param  string className The name of the class you want the element to have
		 * @return jspeedyUnique|jspeedyCollection|jspeedyEmpty
		 */
		byClass: function(context, className){
			var selection = context.getElementsByClassName(className);
			var len = selection.length;
			if( len == 1){
				return new jspeedyUnique( selection[0], this );
			}else if( len > 1) {
				return new jspeedyCollection( Array.prototype.slice.apply(selection) , this);
			}
			return new jspeedyEmpty(this);
		},

		/**
		 * Select descendants by their class
		 * @param  Node context A DOM element
		 * @param  string className The name of the class you want the element to have
		 * @return jspeedyUnique|jspeedyCollection|jspeedyEmpty
		 */
		byTag: function(context, tagName){
			var selection = context.getElementsByTagName(tagName);
			var len = selection.length;
			if( len == 1){
				return new jspeedyUnique( selection[0], this );
			}else if( len > 1) {
				return new jspeedyCollection( Array.prototype.slice.apply(selection) , this);
			}
			return new jspeedyEmpty(this);
		},

		/**
		 * Request a context like you do with jquery for children
		 * @param  Node context A DOM element
		 * @param  string selector A jquery like selector '#xxxx' or '.xxxx'
		 * @return jspeedyUnique|jspeedyCollection|jspeedyEmpty
		 */
		find: function(context, selector){
			var method;
			switch(selector.substr(0,1)){
				case '#':
					method = 'byId';
				case '.':
					method = method || 'byClass';
					return jspeedyCore[method](context,selector.substr(1));
			}
			return new jspeedyEmpty();
		},

		/**
		 * Get the $parent of the context
		 * @param  Node context A DOM element
		 * @return jspeedyUnique
		 */
		parent: function(context){
			return new jspeedyUnique( context.parentNode, this );
		},

		closest: function(context, className){
			var target = context;
			while(target){
				if( jspeedyCore.hasClass(target,className)){
					return jspeedyCore.getNew(this, target);
				}
				target = target.parentNode;
			}
			return new jspeedyEmpty(this);
		},

		/**
		 * Append some html at the end of a DOM element
		 * @param  Node 	context	   A DOM element
		 * @param  string   html       The html you want to put at the end
		 * @param  boolean  returnItem Do you want to return the appended html jspeedyElement
		 * @return mixed
		 */
		appendHTML: function(context, html, returnItem){
			context.insertAdjacentHTML('beforeend',html);
			if(returnItem){
				return new jspeedyUnique( context.lastChild, (this instanceof jspeedyEmpty ? document : this) );
			}else{
				return this;
			}
		},

		append: function(context, $childItem){
			if( $childItem instanceof jspeedyUnique || $childItem instanceof jspeedyEmpty ){
				context.appendChild($childItem.context);
			}else if($childItem instanceof jspeedyCollection){
				$childItem.each(function(item){
					context.appendChild(item);
				});
			}else if($childItem instanceof Array || $childItem instanceof jQuery) {
				for(var i=0;i<$childItem.length;i++){
					if( $childItem[i] ){
						jspeedyCore.append(context, $childItem[i]);
					}
				}
			// TODO : Might do something for empty by appending them and converting them to jspeedyUnique
			}else if( $childItem ){
				context.appendChild($childItem);
			}
			return this;
		},

		prependHTML: function(context, html, returnItem){
			context.insertAdjacentHTML('afterbegin',html);
			if(returnItem){
				return new jspeedyUnique( context.firstChild, this);
			}else{
				return this;
			}
		},

		prepend: function(context, $childItem){
			if( context.firstChild ){
				if( $childItem instanceof jspeedyUnique || $childItem instanceof jspeedyEmpty ){
					context.insertBefore($childItem.context,context.firstChild);
				}else if($childItem instanceof jspeedyCollection){
					$childItem.eachRight(function(item){
						context.insertBefore(item,context.firstChild);
					});
				}else if($childItem instanceof Array) {
					var i = $childItem.length;
					while(i--){
						jspeedyCore.prepend(context, $childItem[i]);
					}
				// TODO : Might do something for empty by appending them and converting them to jspeedyUnique
				}else{
					context.insertBefore($childItem,context.firstChild);
				}
			}else{
				jspeedyCore.append(context,$childItem);
			}
			return this;
		},

		before: function(context, $childItem){
			if( context.parentNode ){
				if( $childItem instanceof jspeedyUnique || $childItem instanceof jspeedyEmpty ){
					context.parentNode.insertBefore( $childItem.context, context);
				}else{

				}
			}
			return this;
		},

		remove: function(context){
			if( context && context.parentNode){
				context.parentNode.removeChild(context);
			}
			return this;
		},

		hasClass: function(context, className){
			return context.className.split(' ').indexOf(className)!==-1;
		},

		addClass: function(context, className){
			if(!jspeedyCore.hasClass(context, className)){
				context.className += ' '+className;
			}
			return this;
		},

		removeClass: function(context, className){
			var cClassName = ' '+context.className+' ';
			var newClassName = cClassName.replace(' '+className+' ',' ').trim();
			if(cClassName !== newClassName){
			// if(cClassName !== newClassName && newClassName !== ''){
				context.className = newClassName;
			}
			return this;
		},

		removeClassPrefix: function(context, classPrefix){
			var classes = context.className.split(" ").filter(function(c) {
				return c.lastIndexOf(classPrefix, 0) !== 0;
			});
			context.className = classes.join(" ");
			return this;
		},

		toggleClass: function(context, className){
			if( jspeedyCore.hasClass(context, className) ) jspeedyCore.removeClass(context, className);
			else jspeedyCore.addClass(context, className);
			return this;
		},

		html: function(context, html){
			if( html === undefined){
				return context.innerHTML;
			}else{
				if( context.innerHTML !== html){
					context.innerHTML = html;
				}
				return this;
			}
		},

		text: function(context, text){
			return jspeedyCore.html(context, text);
		},

		val: function(context, value){
			if(value === undefined){
				return context.value;
			}else{
				context.value = value;
				return this;
			}
		},

		attr: function(context, attribute, value){
			if( value === undefined ){
				return context.getAttribute(attribute);
			}else{
				if(value){
					context.setAttribute(attribute,value);
				}else{
					context.removeAttribute(attribute);
				}
				return this;
			}
		},

		data: function(context, key, value){
			if(value===undefined){
				if( this._dataCache[key]){
					return this._dataCache[key];
				}else{
					return context.dataset[key];
				}
			}else{
				if( value instanceof Object){
					this._dataCache[key] = value;
				}else{
					context.dataset[key] = value;
				}
				return this;
			}
		},

		width: function(context, value){
			if(value===undefined){
				return context.offsetWidth;
			}else{
				return (context.style.width = parseInt(value)+"px");
			}
		},

		height: function(context, value){
			if(value===undefined){
				return context.offsetHeight;
			}else{
				return (context.style.height = parseInt(value)+"px");
			}
		},

		offset: function(context, inWindow){
			inWindow = !!inWindow;
			var rect = context.getBoundingClientRect();
			if(inWindow){
				return rect;
			}else{
				return {
					top: rect.top + document.body.scrollTop,
					left: rect.left + document.body.scrollLeft
				};
			}
		},

		position: function(context){
			return {left: context.offsetLeft, top: context.offsetTop};
		},

		get: function(context){
			return context;
		},

		eq: function(context){
			return this;
		},

		index: function(context){
			var index = 0, node = context;
			while( (node = node.previousElementSibling) ){
				index++;
			}
			return index;
		},

		/**
		 * Init handlers of a particular DOM node
		 * @param  Node 	context	   A DOM element
		 * @return null
		 */
		initHandlers: function(context){
			if(!context.handlers) context.handlers = {};
			if(!context.listener) context.listener = {};
		},

		on: function(context, eventString, className, listener, once){

			// if called without className
			if(className instanceof Function){
				once = listener;
				listener = className;
				className = null;
			}

			once = !!once;

			var $target = this,
				eventNS,
				eventTypes = jspeedyCore.splitEvent(eventString),
				len = eventTypes.length,
				ei,
				eventType,
				splitted
				;

			for(ei=0;ei<len;ei++){
				eventType = eventTypes[ei];
				if( eventType.indexOf('.')>=0 ){ // be carefull not to have multiple .
					splitted = eventType.split('.');
					eventType = splitted[0];
					eventNS = splitted[1];
				}else eventNS = null;

				jspeedyCore.initHandlers(context);

				if( context.handlers[eventType] === undefined ){
					context.handlers[eventType] = [];
					context.listener[eventType] = function(){ $target.eventListener.apply($target,arguments); };
					context.addEventListener(eventType,context.listener[eventType],false);
				}

				context.handlers[eventType].push({ eventNS: eventNS, className: className, listener: listener, once: once});
			}

			return this;
		},

		eventListener: function(context, event){
			var jEvent = jspeedyCore.createJspeedyEvent(event), eventType = jEvent.type;
			var i, j, len = context.handlers[eventType].length, target = jEvent.target, item ;
			var onceToDelete;
			while(target){
				onceToDelete = [];
				for(i=0;i<len;i++){
					eventHandler = context.handlers[eventType][i];
					if( ( eventHandler.className === null && target === context) || jspeedyCore.hasClass(target, eventHandler.className)){
						eventHandler.listener.call(target,jEvent);
						// if one/once , add it to the one to delete
						if( eventHandler.once ){
							onceToDelete.push(eventHandler);
						}
						if( jEvent.isImmediatePropagationStopped ) break;
					}
				}
				// delete one/once event
				if( onceToDelete.length ){
					for(j=0;j<onceToDelete.length;j++){
						if( (pos = context.handlers[eventType].indexOf( onceToDelete[j] )) !== -1){
							context.handlers[eventType].splice(pos,1);
						}
					}
				}

				if( target === context || jEvent.isPropagationStopped ) break;
				target = target.parentElement;
			}
		},

		one: function(context, eventString, className, listener){
			return jspeedyCore.on(context, eventString, className, listener, true);
		},

		off: function(context, eventString, className){
			if( context.handlers ){
				var eventTypes = jspeedyCore.splitEvent(eventString), ei, len = eventTypes.length, eventType, eventNS, hlen, k, j;

				if( len ){
					for(ei=0;ei<len;ei++){
						eventType = eventTypes[ei];
						if( eventType.indexOf('.')>=0 ){ // be carefull not to have multiple .
							splitted = eventType.split('.');
							eventType = splitted[0];
							eventNS = splitted[1];
						}else eventNS = null;

						if( !eventType && eventNS){
							for(k in context.handlers){
								j = context.handlers[k].length;
								while(j--){
									if( context.handlers[k][j].eventNS === eventNS){
										context.handlers[k].splice(j,1);
									}
								}
								if( context.handlers[k].length === 0){
									jspeedyCore.removeHandler(context,k);
								}
							}
						}else{
							if( context.handlers[eventType] && context.handlers[eventType].length ){
								j = context.handlers[eventType].length;
								while(j--){
									if( !eventNS || (context.handlers[eventType][j].eventNS === eventNS) ){
										context.handlers[eventType].splice(j,1);
									}
								}
							}
							if( context.handlers[eventType].length === 0){
								jspeedyCore.removeHandler(context,eventType);
							}
						}
					}
				}else{
					// we delete all handlers
					for(k in context.handlers){
						jspeedyCore.removeHandler(context,k);
					}
					context.handlers = {};
				}
			}
			return this;
		},

		removeHandler: function(context, eventType){
			context.removeEventListener(eventType,context.listener[eventType],false);
			return this;
		},

		unbind: function(context, eventString, className){
			return jspeedyCore.off(context, eventString, className);
		},


		/**
		 * Split an event string of events separated by space
		 * @param  string eventString
		 * @return Array
		 */
		splitEvent: function(eventString){
			var eventTypes;
			if(eventString===undefined || eventString===null){
				eventTypes = [];
			}else if( eventString.indexOf(' ') ){
				eventTypes = eventString.split(' ');
			}else{
				eventTypes = [eventString];
			}
			return eventTypes;
		},

		/**
		 * Create a new jEvent based on a real event
		 * @param  Event event The event you want to base the jEvent on
		 * @return jEvent
		 */
		createJspeedyEvent: function(event){
			var jEvent = event;
			// jEvent.originalEvent = event;
			jEvent.isPropagationStopped = false;
			jEvent.isImmediatePropagationStopped = false;
			jEvent.stopPropagation = function() {
				var e = this.originalEvent;
				jEvent.isPropagationStopped = true;
				if ( e && e.stopPropagation ) {
					e.stopPropagation();
				}
			};
			jEvent.stopImmediatePropagation = function() {
				var e = this.originalEvent;
				jEvent.isImmediatePropagationStopped = true;
				if ( e && e.stopImmediatePropagation ) {
					e.stopImmediatePropagation();
				}
				this.stopPropagation();
			};
			return jEvent;
		},

		focus: function(context){ return this.$(context).focus(); },
		blur: function(context){ return this.$(context).blur(); },

		extend: function(out){
			out = out || {};

			for (var i = 1; i < arguments.length; i++) {
				var obj = arguments[i];
				if (!obj) continue;
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (typeof obj[key] === 'object'){
							deepExtend(out[key], obj[key]);
						}else{
							out[key] = obj[key];
						}
					}
				}
			}

			return out;
		}
	};

	/**
	 * This is the core method of jspeedy
	 * NOTE : You can use it like jquery with directly a selector
	 * NOTE : Performance are better if you request directly what you want with byId or byClass
	 */
	var jspeedyRequester = function(request, context){
		return jspeedyCore.find(context||document, request);
	};
	jspeedyRequester.byId = function(id){ return jspeedyCore.byId(document, id); };
	jspeedyRequester.byClass = function(className){ return jspeedyCore.byClass(document, className); };
	jspeedyRequester.getNew = function(element){ return jspeedyCore.getNew(document, element); };
	jspeedyRequester.createFromHTML = function(html){ return jspeedyCore.createFromHTML(document, html); };
	jspeedyRequester.extend = function(){ return jspeedyCore.extend.apply({},arguments); };

	/**
	 * This is the object for a one item jspeedyElement
	 */
	var jspeedyUnique = function(context, parentJspeedy) {
		this.context = context;
		this.length = 1;
		this.context.handlers = this.context.handlers || {};
		this.context.listener = this.context.listener || {};
		this.parentJspeedy = parentJspeedy;
		this._dataCache = {};
	};

	jspeedyUnique.prototype = {
		destroy: function(){
			if( this._$jqueryVersion ) delete(this._$jqueryVersion);
			if( this.context){
				this.off();
				if( this.context.handlers ) delete(this.context.handlers);
				if( this.context.listener ) delete(this.context.listener);
				this.context = null;
			}
			return this;
		},
	};

	/**
	 * This is the object for a multiple items jspeedyElement
	 */
	var jspeedyCollection = function(collection, parentJspeedy){
		this.collection = collection;
		this.length = this.collection.length;
		this.parentJspeedy = parentJspeedy;
	};

	jspeedyCollection.prototype = {
		each: function(cb, context){
			var i, len = this.collection.length;
			// cb = context ? function(item,i){ cb.call(context,item,i); } : cb;
			for (i=0; i < len; i++) {
				if( cb( this.collection[i],i) === false ) break;
			}
		},
		eachRight: function (cb, context) {
			var i = this.collection.length;
			// cb = context ? function(item,i){ cb.call(context,item,i); } : cb;
			while(i--){
				if( cb( this.collection[i],i) === false ) break;
			}
		},
		get: function(position){
			return this.collection[position] ? this.collection[position] : undefined;
		},
		eq: function(position){
			return this.collection[position] ? new jspeedyUnique(this.collection[position],this) : undefined;
		},
		destroy: function(){
			if( this.collection){
				var i = this.collection.length;
				while(i--){
					this.collection.pop();
				}
			}
			return this;
		},
	};

	/**
	 * This is the element for an empty jspeedyElement
	 * NOTE : actually this create a DOM element not attached to the document to allow all call to work
	 * NOTE : it might be use to create a DOM something from scratch
	 */
	var jspeedyEmpty = function(parentJspeedy, elementType){
		elementType = elementType || 'div';
		this.context = document.createElement(elementType);
		this.length = 0;
		this.parentJspeedy = parentJspeedy;
	};
	jspeedyEmpty.prototype = jspeedyUnique.prototype;


	/**
	 * Add jspeedyCollection prototype functions from the core
	 * NOTE IMPORTANT : actually (2014-06-30) the argX is far quicker than apply
	 */
	var returnJspeedy = ['find','parent'];

	for(var k in jspeedyCore){
		if( jspeedyCollection.prototype[k] ) continue;
		(function(functionName){
			var myFunc;
			if( functionName.indexOf('has') === 0){
				myFunc = function(arg1, arg2, arg3, arg4, arg5, arg6){
					var state = false;
					this.each(function(item){
						if( state = jspeedyCore[functionName](item,arg1, arg2, arg3, arg4, arg5, arg6)){
							return false;
						}
					});
					return state;
				};
			}else if( functionName.indexOf('by') === 0 || (returnJspeedy.indexOf(functionName)!==-1) ){
				myFunc = function(arg1, arg2, arg3, arg4, arg5, arg6){
					var returns = [];
					this.each(function(item){
						var r = jspeedyCore[functionName](item, arg1, arg2, arg3, arg4, arg5, arg6);
						if( r instanceof jspeedyUnique) returns.push(r.context);
						else if( r instanceof jspeedyCollection) returns.concat( r.collection );
					});
					var len = returns.length;
					if( len == 1){
						return new jspeedyUnique(returns[0], this);
					}else if( len > 1) {
						return new jspeedyCollection(returns, this);
					}else{
						return new jspeedyEmpty(this);
					}
				};
			}else{
				myFunc = function(arg1, arg2, arg3, arg4, arg5, arg6){
					this.each(function(item){
						jspeedyCore[functionName](item, arg1, arg2, arg3, arg4, arg5, arg6);
					});
					return this;
				};
			}
			jspeedyCollection.prototype[functionName] = myFunc;
		})(k);
	}

	/**
	 * Generate jspeedyUnique prototype from the core
	 */
	for(var k in jspeedyCore){
		if( jspeedyUnique.prototype[k] ) continue;
		(function(functionName){

			if( functionName==='$'){
				jspeedyUnique.prototype[functionName] = function(arg1, arg2, arg3, arg4, arg5, arg6){
					if( this.context ){
						return jspeedyCore[functionName].call(this,this.context, arg1, arg2, arg3, arg4, arg5, arg6);
					}
					return $();
				};
			}else{
				jspeedyUnique.prototype[functionName] = function(arg1, arg2, arg3, arg4, arg5, arg6){
					if( this.context ){
						return jspeedyCore[functionName].call(this,this.context, arg1, arg2, arg3, arg4, arg5, arg6);
					}
					return this;
				};
			}

		})(k);
	}

	var $$ = jspeedyRequester;

if( window.define ){
	define(function(){
		return $$;
	});
}