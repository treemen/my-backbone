$(function() {
	//modal 模型
	// 基本的modal 对象 包含`title`, `order`, and `done` attributes.
	var my_todo = Backbone.Model.extend({

		// 设置modal默认值
		defaults:function(){
			return {
				title:"空的todo",
				order:my_todos.nextOrder(),
				done:false
			}
		},		
		//改变todo的状态
		toggle:function(){
			this.save({done:!this.get("done")})
		}
	});

	//Todo Collection 集合类
	/* 由locaStorage 保存数据 模拟服务器存储数据过程*/
	var my_todo_list = Backbone.Collection.extend({
		 //集合Collection 里面保存的引用
		model:my_todo,

		//集合数据保存
		localStorage: new Backbone.LocalStorage("mytodos_backbone"),

		// Filter down the list of all todo items that are finished.
	    done: function() {
	      return this.where({done: true});
	    },

	    // Filter down the list to only todo items that are still not finished.
	    remaining: function() {
	      return this.where({done: false});
	    },

	    // We keep the Todos in sequential order, despite being saved by unordered
	    // GUID in the database. This generates the next order number for new items.
	    nextOrder: function() {
	      if (!this.length) return 1;
	      return this.last().get('order') + 1;
	    },

	    // Todos are sorted by their original insertion order.
	    comparator: 'order'
	});

	//创建全局的collection对象
	var my_todos = new my_todo_list;

	// todo 视图
	var my_todo_view = Backbone.View.extend({
		//标签名称
		tagName:"li",
		//制定模板
		template:_.template($('#item-template').html()),
		//绑定事件
		events: {
			  "click .toggle"   : "toggleDone",
		      "dblclick .view"  : "edit",
		      "click a.destroy" : "clear",
		      "keypress .edit"  : "updateOnEnter",
		      "blur .edit"      : "close"
		},
		//视图初始化和绑定视图变化
		initialize: function(){
			this.listenTo(this.model,"change",this.render);
			this.listenTo(this.model,"destroy",this.remove);
		},

		//渲染视图对象
		render: function() {
		    this.$el.html(this.template(this.model.toJSON()));
	        this.$el.toggleClass('done', this.model.get('done'));
	        this.input = this.$('.edit');
  		    return this;
		},

		//toggleDone 状态切换
		toggleDone: function() {
			this.model.toggle();
		},

		//双击点击编辑
		edit: function (e) {
			console.log(this);
			console.log(e)
		 	this.$el.addClass("editing");
  			this.input.focus();
		},
		//保存编辑后的数据
		close: function(){
			var val = this.input.val();
			if(!val){
				this.clear();
			}else{
				this.model.save({title: value});
				this.$el.removeClass("editing");
			}
		},
		//移除model 销毁视图
		clear: function() {
     	 	this.model.destroy();
    	},
    	//保存对象
    	updateOnEnter: function(e){
    		if (e.keyCode == 13) this.close();
    	}
	});

	//全局初始化对象
	var app =  Backbone.View.extend( {
		el: $(".todosapp"),
		stateTemplate: _.template($('#state-template').html()),
		events: {
			 "keypress #new-todo":  "createOnEnter",
		     "click #clear-completed": "clearCompleted",
		     "click #toggle-all": "toggleAllComplete"
		},
		initialize: function() {
			 this.input = this.$("#new-todo");
			 this.allCheckBox = this.$("#toggle-all")[0];

		     this.listenTo(Todos, 'add', this.addOne);
		     this.listenTo(Todos, 'reset', this.addAll);
		     this.listenTo(Todos, 'all', this.render);

		     this.footer = this.$("footer")
		     this.main = $('#main');
		     //填充数据
		     my_todos.fetch();
		},
		render: function () {
			//已经完成的
			var doneLength = my_todos.done().length;
			//剩余的
			var remainingLength = my_todos.remaining().length;
			if (my_todos.length) {
			    this.main.show();
    			this.footer.show();
    			console.log("error");
    			this.footer.html(this.statsTemplate({done: done, remaining: remaining}));

			}else{
				 this.main.hide();
    			this.footer.hide();
			}
			 this.allCheckbox.checked = !remaining;
		},

		//添加一个新的todoView
		addOne: function (my_todo) {
		 var newView = new 	my_todo_view({model:my_todo});
		 this.$("#todos-list").append(newView.render().el);			
		},
		//添加所有的
		addAll: function () {
			my_todos.each(this.addOne,this);
		},
		//按enter 时 添加
		createOnEnter: function (e) {
			if(e.keyCode != 13) return;
			if(!this.input.val()) return;
			my_todos.create({title:this.input.val()});
			this.input.val("");
		},
		//清除所有已经完成的todo
		clearCompleted: function  () {
		 	_.invoke(my_todos.done,"destroy");
		},
		toggleAllComplete: function  (argument) {
			var done = this.allCheckbox.checked;
			my_todos.each(function(my_todo){
				my_todo.save({'done':done})
			});
		},
	});
	
	 var App = new AppView;	
});