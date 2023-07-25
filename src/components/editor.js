import { useEffect , useState} from 'react'
import '../css/editor.css'


export default function Editor(){

    // 특정 요소에서 마우스 이벤트 캐치 //
    let mouseOverMainState = false;
    let mouseUpCanState = false;
    const mouseOverMain = function(state){
        mouseOverMainState = state;
    };
    const mouseUpCan = function(state){
        if(mouseOverMainState){
            mouseUpCanState = state
        }
    }
    
    // 휴지통 마우스 이벤트 //
    const throwCan = function(){
      const main = document.querySelector('.mainboxbox');
      main.style.transition = '.3s ease'
      main.style.opacity = '0.5'
      main.remove()
    }

    useEffect(function(){
      const can = document.querySelector('.can');
      // 마우스로 요소 이동 //
      const main = document.querySelector('.mainboxbox');
      let [poLeft, poTop] =[+main.offsetLeft, +main.offsetTop]
      window.addEventListener('mousemove',function(event){
        event.preventDefault();
        if(main){
          if(mouseOverMainState){
              const mx = event.movementX;
              const my = event.movementY;
              poLeft += mx; poTop += my;
              if(main.offsetTop < 0){
                  const ih = window.innerHeight;
                  mouseOverMainState = false
                  main.style.transition = '.3s ease'
                  poTop = ih/2;
              }else{
                  main.style.transition = ''
              }
          }
          main.style.top = `${poTop}px`
          main.style.left = `${poLeft}px`
        }
      })
      //휴지통 위 마우스 해제 시 이벤트 발생 //
      window.addEventListener('mouseup',function(e){
        if(mouseOverMainState && mouseUpCanState){
            throwCan();
            mouseUpCan(false);
        }
          mouseOverMain(false);
      })
    })
    // ----------------------------------------------
    const [textList, settextList] = useState([]);
    const addText = function(){
        settextList(state => [...textList, {value : null}])
    }
    const textDbcl = function(e){
        const q = e.target;
        q.classList.add('text_active');
        q.classList.remove('text_done','text_empty')
    }
    const textBlur = function(e){
        const q = e.target;
        q.classList.add('text_done');
        q.classList.remove('text_active','text_empty')
    }
    const textchange = function(e,i){
        const q = e.target;
        const val = q.value;
        settextList(state => state[i].value = val)
    }
    useEffect(function(){
    })

  return(
    <div id="editorBox">
        <div className="btnBox">
            <button onClick={(e) => {e.preventDefault(); addText()}}>text</button>
        </div>
        <div className="contentsBox">
            <div className="cb_text">
                {textList.map((v,i) => (
                    <textarea name={"textarea_" + i} key={"textarea_" + i} className='cb_text_input'
                    onDoubleClick={(e) => textDbcl(e)} onBlur={(e) => textBlur(e)} onInput={(e) => textchange(e,i)}
                    value='ssssssssssss'></textarea>
                ))}
            </div>
            <div className="cb_sticker">
                <div className="mainboxbox" onMouseDown={()=>mouseOverMain(true)}></div>

            </div>
            <div className="can" onMouseEnter={()=>mouseUpCan(true)}></div>
        </div>
    </div>
  )
}