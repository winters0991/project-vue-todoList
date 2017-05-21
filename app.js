import Vue from 'vue'
import AV from 'leancloud-storage'
import css from './css.css'

//设置leancloud=>class=>todo=>应用key
var APP_ID = 'uEKhNwQUmI9U4Q53EO7BjMC1-gzGzoHsz'
var APP_KEY = '5CUyWQef9FQnybiDuS3e8ytP'

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

var app = new Vue({
  el: '#app',
  data: {
    actionType: 'signUp',
    formData: {
      username: '',
      password: ''
    },
    newTodo: '',
    todoList: [],
    currentUser: null,  
    finishFocus: 'all', 
  },
  created: function(){
    this.currentUser = this.getCurrentUser();    
    this.fetchTodos()
  },
  methods: {
    addTodo: function(){
      if(this.newTodo === ''){
        alert('请输入待办事项')
        return
      }
      this.todoList.push({
        title: this.newTodo,
        createdAt: this.createTime(),
        finished: false
      })
      this.newTodo = ''
      this.saveOrUpdateTodos() 
    },
    createTime: function(){
      let date = new Date(),
          time = date.getFullYear() + '年' + (date.getMonth()+1) + '月' 
          + date.getDate() + '日' + date.getHours() + ':' 
          + date.getMinutes() + ':' + date.getSeconds()   
      return time
    },
    removeTodo: function(todo){
      let index = this.todoList.indexOf(todo) 
      this.todoList.splice(index,1) 
      this.saveOrUpdateTodos() 
    },    
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => { //将 function 改成箭头函数，方便使用 this
        alert('注册成功，请牢记您的用户名和密码！') 
        this.currentUser = this.getCurrentUser()   
      }, (error) => {
        alert('注册失败') 
        console.log(error)        
      });
    },
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => { 
        this.currentUser = this.getCurrentUser() 
        this.fetchTodos() // 登录成功后读取 todos           
      }, function (error) {
        alert('登录失败') 
        console.log(error)        
      });   
    },    
    logout: function () {
      AV.User.logOut()
      this.currentUser = null
      window.location.reload()//刷新页面 
    },   
    changeFinish: function(todo){
      todo.finished = !todo.finished
    },   
    clearAll: function (){
      this.todoList = []    
      this.saveOrUpdateTodos()       
    },
    saveOriginTodo: function(){
      this.originTodo = this.todoList
    },
    filterAll: function (){
      if(this.originTodo === undefined){
        return
      }
      else{    
          this.todoList = this.originTodo
      }
      this.finishFocus = 'all'
    },   
    filterTodo: function (){
      this.filterAll()
      this.saveOriginTodo()
      let needTodo = []
      for(var i = 0; i < this.todoList.length; i++){
        let lists = this.todoList[i]
        if(lists.finished === false){
          needTodo.push(lists)
        }
      }
      this.todoList = needTodo
      this.finishFocus = 'todo'      
    }, 
    filterDone: function (){
      this.filterAll()      
      this.saveOriginTodo()         
      let doneTodo = []
      for(var i = 0; i < this.todoList.length; i++){
        let lists = this.todoList[i]
        if(lists.finished === true){
          doneTodo.push(lists)
        }
      }
      this.todoList = doneTodo
      this.finishFocus = 'done'      
    },          
    saveOrUpdateTodos: function(){
      if(this.todoList.id){
        this.updateTodos()
      }else{
        this.saveTodos()
      }
    },    
    saveTodos: function(){
      let dataString = JSON.stringify(this.todoList)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      var acl = new AV.ACL()//新建一个ACL实例
      acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
      acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写

      avTodos.set('content', dataString);
      avTodos.setACL(acl) // 设置访问控制，将ACL实例赋予avTodos对象
      avTodos.save().then((todo) =>{
        this.todoList.id = todo.id  // 一定要把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos 
        console.log('保存成功');
      }, function (error) {
        alert('保存失败');
      });
    },   
    updateTodos: function(){
      let dataString = JSON.stringify(this.todoList) 
      let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
      avTodos.set('content', dataString)
      avTodos.save().then(()=>{
        console.log('更新成功')
      })
    },     
    fetchTodos: function(){
      if(this.currentUser){
        var query = new AV.Query('AllTodos');
        query.find()
          .then((todos) => {
            let avAllTodos = todos[0] // 因为理论上 AllTodos 只有一个，所以取结果的第一项
            let id = avAllTodos.id
            this.todoList = JSON.parse(avAllTodos.attributes.content) // 从控制台查到attributes
            this.todoList.id = id // 数组也是对象,给 todoList 这个数组设置 id
          }, function(error){
            console.error(error) 
          })
      }
    }, 
    getCurrentUser: function () {
      let current = AV.User.current()
      if (current) {
        let {id, createdAt, attributes: {username}} = current //解构赋值
        return {id, username, createdAt} 
      } else {
        return null
      }
    }
          
  }
})