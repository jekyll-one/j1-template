/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/visualizations/circular-equalizer.js
 # AmplitudeJS v5.3.2 Visualization (FX)
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/serversideup/amplitudejs
 #
 # Copyright (C) 2021 521 Dimensions
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Amplitudejs is licensed under the MIT License.
 # See: https://github.com/serversideup/amplitudejs/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

function CircularEqualizer(){this.id="circular_equalizer",this.name="Circular Equalizer",this.container="",this.preferences={barWidth:2,barHeight:2,barSpacing:5,barColor:"#ffffff",shadowColor:"#ffffff",shadowBlur:10},this.analyser="",this.frequencyData=[],this.canvas=null,this.canvasCtx=null,this.gradient=null,this.getID=function(){return this.id},this.getName=function(){return this.name},this.setPreferences=function(t){for(var e in this.preferences)null!=t[e]&&(this.preferences[e]=t[e])},this.startVisualization=function(t){this.analyser=Amplitude.getAnalyser(),this.container=t,window.cont=this.container,this.canvas=document.createElement("canvas"),this.canvas.width=this.container.offsetWidth,this.canvas.height=this.container.offsetHeight,this.container.appendChild(this.canvas),this.canvasCtx=this.canvas.getContext("2d"),this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount),this.gradient=this.canvasCtx.createLinearGradient(0,0,0,400),this.gradient.addColorStop(0,this.preferences.barColor),this.gradient.addColorStop(1,"orange"),this.canvasCtx.fillStyle=this.gradient,this.canvasCtx.shadowBlur=this.preferences.shadowBlur,this.canvasCtx.shadowColor=this.preferences.shadowColor,requestAnimationFrame(this.renderFrame.bind(this))},this.stopVisualization=function(){this.container.innerHTML="",window.cancelAnimationFrame(this.renderFrame.bind(this))},this.renderFrame=function(){requestAnimationFrame(this.renderFrame.bind(this)),this.analyser.getByteFrequencyData(this.frequencyData),this.canvasCtx.clearRect(0,0,this.canvas.width,this.canvas.height);for(var t=this.canvas.width/2,e=this.canvas.height/2,a=t-27,i=Math.floor(2*a*Math.PI/(this.preferences.barWidth+this.preferences.barSpacing)),s=i-Math.floor(25*i/100),n=Math.floor(this.frequencyData.length/i),r=0;r<s;r++){var h=this.frequencyData[r*n],c=2*r*Math.PI/i+Math.PI,o=(135-this.preferences.barWidth)*Math.PI/180,f=a-(h/12-this.preferences.barHeight),l=this.preferences.barWidth,d=h/6+this.preferences.barHeight;this.canvasCtx.save(),this.canvasCtx.translate(t,e),this.canvasCtx.rotate(c-o),this.canvasCtx.fillRect(0,f,l,d),this.canvasCtx.restore()}}}
