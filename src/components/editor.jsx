import { useEffect , useState} from 'react'
import '../css/editor.css'
import html2canvas from 'html2canvas';

export default function Editor(){
    // 특정 요소에서 마우스 이벤트 캐치 //
    let mouseShapeState = false;
    let mouseUpCanState = false;
    const mouseOverMain = function(state){
        mouseShapeState = state;
    };
    const mouseUpCan = function(state){
        if(mouseShapeState){
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

    const [main, setmain] = useState();
    useEffect(function(){
        const contentsBox = document.querySelector(".contentsBox");
        const qq = contentsBox.childNodes;
        qq.forEach(v => {
            let keyval;
            v.addEventListener('mousedown',function(event){
                keyval = true
                const elem = event.target;
                let [poLeft, poTop] = [+elem.offsetLeft, +elem.offsetTop]
                window.addEventListener('mousemove',function(event){
                    event.preventDefault();
                    if(keyval){
                        const mx = event.movementX;
                        const my = event.movementY;
                        poLeft += mx; poTop += my;
                        if(elem.offsetTop < 0){
                            const ih = window.innerHeight;
                            keyval = false
                            elem.style.transition = '.3s ease'
                            poTop = ih/2;
                        }else{
                            elem.style.transition = ''
                        }
                    }
                    elem.style.top = `${poTop}px`
                    elem.style.left = `${poLeft}px`
                })
            })
            window.addEventListener('mouseup',function(e){
                if(keyval && mouseUpCanState){
                    throwCan();
                    // mouseUpCan(false);
                }
                keyval = false
            })
        })
    })

    // useEffect(function(){
    //   // 마우스로 요소 이동 //
    //   const main = document.querySelector('.mainboxbox');
    // let [poLeft, poTop] = [+main.offsetLeft, +main.offsetTop]
    // window.addEventListener('mousemove',function(event){
    //     event.preventDefault();
    //     if(main){
    //       if(mouseShapeState){
    //           const mx = event.movementX;
    //           const my = event.movementY;
    //           poLeft += mx; poTop += my;
    //           if(main.offsetTop < 0){
    //               const ih = window.innerHeight;
    //               mouseShapeState = false
    //               main.style.transition = '.3s ease'
    //               poTop = ih/2;
    //           }else{
    //               main.style.transition = ''
    //           }
    //       }
    //       main.style.top = `${poTop}px`
    //       main.style.left = `${poLeft}px`
    //     }
    //   })
    //   //휴지통 위 마우스 해제 시 이벤트 발생 //
    //   window.addEventListener('mouseup',function(e){
    //     if(mouseShapeState && mouseUpCanState){
    //         throwCan();
    //         mouseUpCan(false);
    //     }
    //       mouseOverMain(false);
    //   })
    // })

    // ----------------------------------------------
    const [textList, settextList] = useState([]);
    const addText = function(){
        settextList(state => [...textList, {value : null}])
    }
    const textDbcl = function(e){
        const q = e.target;
        q.classList.add('text_active');
        q.classList.remove('text_done','text_empty')
        q.removeAttribute('disabled');
        q.focus()
    }
    
    const textBlur = function(e){
        const q = e.target;
        q.classList.add('text_done');
        q.classList.remove('text_active','text_empty')
        q.setAttribute('disabled',true);
    }
    const textchange = function(e,i){
        const q = e.target;
        const val = q.value;
        settextList(state => {
            const w = [...state];
            w[i] = {...w[i] , value : val}
            return w
        })
    }

    const [shapes, setshapes] = useState([]);
    const addShape = function(){
        setshapes(state => [...shapes, null])
    }

    // ==================================
    const [imgs, setimgs] = useState();
    const captureElement = function(){
        const elem = document.getElementById('elementToCapture')
        if(elem){
            html2canvas(elem).then((canvas) => {
                const image = canvas.toDataURL('image/png');
                console.log(image)
                setimgs(state => image);
            })
        }
    }
  return(
    <div id="editorBox">
        <div className="btnBox">
            <button onClick={(e) => {e.preventDefault(); addText()}}>text</button>
            <button onClick={(e) => {e.preventDefault(); addShape()}}>shape</button>
            <button onClick={() => captureElement()}>ddddd</button>
        </div>
        <div className="contentsBox" id='elementToCapture'>
                {textList.map((v,i) => (
                    <div key={"textarea_" + i}>
                        <textarea name={"textarea_" + i}  className='cb_text_input'
                        onDoubleClick={(e) => textDbcl(e)} onBlur={(e) => textBlur(e)} onInput={(e) => textchange(e,i)}
                        onMouseDown={()=>{mouseOverMain(true)}} autoFocus={true} 
                        ></textarea>
                    </div>
                ))}
                <div className="mainboxbox" onMouseDown={()=>{mouseOverMain(true)}}></div>
                {shapes.map((v,i)=>{
                    return(<div key={"shape_"+i} className="mainboxbox" onMouseDown={()=>{mouseOverMain(true)}}></div>)
                })}
            <div className="can" onMouseEnter={()=>mouseUpCan(true)}></div>
        </div>
        <div>
            <img src={imgs} alt="" />
        </div>
    </div>
  )
}