// ELEMENTS
const loginScreen = document.getElementById("loginScreen")
const appScreen = document.getElementById("appScreen")
const welcomeText = document.getElementById("welcomeText")
const startBtn = document.getElementById("startBtn")
const goalsList = document.getElementById("goalsList")
const updateGoalsBtn = document.getElementById("updateGoalsBtn")
const motivationBox = document.getElementById("motivationBox")
const checkboxGrid = document.getElementById("checkboxGrid")

// GLOBAL VARIABLES
let name = localStorage.getItem("name")
let goals = JSON.parse(localStorage.getItem("goals")) || []
let firstLogin = localStorage.getItem("firstLogin")

if(firstLogin){
  firstLogin = new Date(firstLogin)
}else{
  firstLogin = new Date()
  localStorage.setItem("firstLogin", firstLogin.toISOString())
}

// LOGIN HANDLER
startBtn.addEventListener("click", ()=>{
  const inputName = document.getElementById("nameInput").value
  const g1 = document.getElementById("goal1").value
  const g2 = document.getElementById("goal2").value
  const g3 = document.getElementById("goal3").value

  if(inputName && g1 && g2 && g3){
    name = inputName
    goals = [g1,g2,g3]
    localStorage.setItem("name",name)
    localStorage.setItem("goals",JSON.stringify(goals))
    startApp()
  }else{
    alert("Enter your name and 3 goals")
  }
})

// UPDATE GOALS
updateGoalsBtn.addEventListener("click", ()=>{
  const newGoals = prompt("Enter your 3 permanent goals separated by commas").split(",")
  if(newGoals.length===3){
    goals=newGoals
    localStorage.setItem("goals",JSON.stringify(goals))
    displayGoals()
  }else{
    alert("Please enter exactly 3 goals")
  }
})

// START APP
function startApp(){
  loginScreen.classList.add("hidden")
  appScreen.classList.remove("hidden")
  welcomeText.innerText = `Welcome ${name}`
  displayGoals()
  buildCheckboxes()
  updateGraphs()
  showMotivation()
}

// DISPLAY GOALS
function displayGoals(){
  goalsList.innerHTML=""
  goals.forEach(g=>{
    const li = document.createElement("li")
    li.innerText=g
    goalsList.appendChild(li)
  })
}

// DATE HELPERS
const today = new Date()
const todayIndex = Math.floor((today-firstLogin)/(1000*60*60*24))

// BUILD 90 CHECKBOXES (3 per day)
function buildCheckboxes(){
  checkboxGrid.innerHTML=""
  for(let i=0;i<90;i++){
    const box = document.createElement("input")
    box.type="checkbox"
    box.id="box_"+i
    if(i>=todayIndex*3 && i<todayIndex*3+3){
      box.disabled=false
    }else{
      box.disabled=true
    }

    if(localStorage.getItem("box_"+i)=="true"){
      box.checked=true
    }

    box.addEventListener("change",()=>{
      localStorage.setItem("box_"+i,box.checked)
      updateGraphs()
      showMotivation()
    })

    checkboxGrid.appendChild(box)
  }
}

// COUNT DONE
function countDone(limit){
  let done=0
  for(let i=0;i<limit;i++){
    if(localStorage.getItem("box_"+i)=="true") done++
  }
  return done
}

// UPDATE CIRCLE/DONUT
function updateGraph(elId,percent){
  percent = Math.max(0,Math.min(100,percent))
  const el = document.getElementById(elId)
  if(el.classList.contains("donutGraph")){
    el.style.background = `conic-gradient(${getColor(percent)} ${percent}%, #1e293b ${percent}%)`
  }else{
    el.style.background = getColor(percent)
  }
  el.querySelector("span").textContent = percent + "%"
}

// GET COLOR BASED ON %
function getColor(percent){
  if(percent>=80) return "#22c55e" // green
  else if(percent>=70) return "#facc15" // yellow
  else return "#ef4444" // red
}

// SHOW MOTIVATION
function showMotivation(){
  const dailyDone = countDone((todayIndex+1)*3)
  let message = ""
  if(dailyDone==3) message=`Great job, ${name}! 🎉 All daily goals done!`
  else if(dailyDone==2) message=`Good, ${name}, keep it going!`
  else if(dailyDone==1) message=`Come on ${name}, you can do more!`
  else message=`Let's start today, ${name}!`
  motivationBox.innerText=message
}

// UPDATE ALL GRAPHS
function updateGraphs(){
  // daily performance
  let dailyDone = 0
  for(let i=todayIndex*3;i<todayIndex*3+3;i++){
    if(localStorage.getItem("box_"+i)=="true") dailyDone++
  }
  let dailyPerf = Math.round((dailyDone/3)*100)

  // weekly performance (relative to days passed * 3)
  const weeklyLimit = Math.min((todayIndex+1)*3,21)
  let weeklyDone = countDone(weeklyLimit)
  let weeklyPerf = Math.round((weeklyDone/weeklyLimit)*100)

  // monthly performance
  const monthlyLimit = Math.min((todayIndex+1)*3,90)
  let monthlyDone = countDone(monthlyLimit)
  let monthlyPerf = Math.round((monthlyDone/monthlyLimit)*100)

  // update performance circles
  updateGraph("dailyPerf",dailyPerf)
  updateGraph("weeklyPerf",weeklyPerf)
  updateGraph("monthlyPerf",monthlyPerf)

  // update actual progress donuts
  updateGraph("dailyDonut",dailyPerf)
  updateGraph("weeklyDonut",Math.round(countDone(21)/21*100))
  updateGraph("monthlyDonut",Math.round(countDone(90)/90*100))
}

// INITIAL START
if(name && goals.length===3){
  startApp()
}const themeBtn = document.getElementById("themeBtn")
let girlishMode=false

themeBtn.addEventListener("click", ()=>{
  if(!girlishMode){
    // switch to girlish
    document.documentElement.style.setProperty("--bg-color","#fff0f6")
    document.documentElement.style.setProperty("--card-bg","#f9d6e3")
    document.documentElement.style.setProperty("--accent-color","#ec4899")
    document.documentElement.style.setProperty("--text-color","#111827")
    girlishMode=true
    themeBtn.innerText="Dark Mode"
  }else{
    // switch back to dark
    document.documentElement.style.setProperty("--bg-color","#0f172a")
    document.documentElement.style.setProperty("--card-bg","#1e293b")
    document.documentElement.style.setProperty("--accent-color","#3b82f6")
    document.documentElement.style.setProperty("--text-color","white")
    girlishMode=false
    themeBtn.innerText="Girlish Mode"
  }
  updateGraphs() // refresh donut colors
})
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js')
    .then(()=>console.log('Service Worker Registered'))
    .catch(err=>console.log('SW registration failed:', err))
}