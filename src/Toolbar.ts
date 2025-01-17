import { AnimationToolBar } from './AnimationToolBar';
import { Layout } from './Layout';
import { ErrorMessage } from './ErrorMessage';
import { OptionManager } from './OptionManager';

export class Toolbar {
    /**
     * initialization
     */
    static init(): void {

        document.getElementById("buttonMovieMode").onclick = AnimationToolBar.toggle;
            
 

        if (Layout.isTactileDevice()) {
            try {
                document.getElementById("inputToolbar").hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the checkbox (in the option menu) is hidden

                const spans = document.getElementsByClassName("keyboardkeyhelp");
                for (let i = 0; i < spans.length; i++) {
                    (<HTMLElement>spans[i]).hidden = true;
                }
            }
            catch (e) {
                ErrorMessage.show("Error in loading the toolbar. You can however use Tableaunoir.")
            }

        }

        OptionManager.boolean({
            name: "toolbar",
            defaultValue: true,
            onChange: (isToolbar) => {
                if (Layout.isTactileDevice()) //on android etc. the toolbar is ALWAYS visible
                    Toolbar.getToolbar().hidden = false;
                else
                    Toolbar.getToolbar().hidden = !isToolbar;
            }
        });



        OptionManager.string({
            name: "toolbarPosition",
            defaultValue: "top",
            onChange: (position) => {
                if (position == "left") Toolbar.left = true;
                if (position == "right") Toolbar.right = true;
                if (position == "bottom") Toolbar.bottom = true;
                if (position == "top") Toolbar.top = true;
            }
        });


        Toolbar.helpButtonDivide();
        Toolbar.helpForButtonCloseControls();

    }


    private static removeTopBottomEtc() {
        const toolbar = Toolbar.getToolbar();
        toolbar.classList.remove("toolbarTop");
        toolbar.classList.remove("toolbarBottom");
        toolbar.classList.remove("toolbarLeft");
        toolbar.classList.remove("toolbarRight");
    }



    /**
     * 
     * @param v 
     * @param className 
     * @description if v is true, then set the orientation of the toolbar to be like the CSS class className
     * 
     */
    private static setOrientationClass(v: boolean, className: string) {
        if (v) {
            Toolbar.removeTopBottomEtc();
            const toolbar = Toolbar.getToolbar();
            toolbar.classList.add(className);
            Layout.layout();
        }
    }







    static get top(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarTop");
    }

    static set top(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarTop");
    }

    static get bottom(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarBottom");
    }

    static set bottom(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarBottom");
    }

    static get left(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarLeft");
    }

    static set left(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarLeft");
    }

    static get right(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarRight");
    }


    static set right(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarRight");
    }


    /**
     * help animation for hiding the toolbar
     */
    static helpForButtonCloseControls(): void {
        document.getElementById("buttonCloseControls").onmouseenter = () => { Toolbar.getToolbar().style.opacity = "0.5" };
        document.getElementById("buttonCloseControls").onmouseleave = () => { Toolbar.getToolbar().style.opacity = "1" };
    }

    /**
     * help animation for divide the screen
     */
    static helpButtonDivide(): void {
        const divideLine = document.createElement("div");
        divideLine.className = "divideLineHelp";

        document.getElementById("buttonDivide").onmouseenter = () => {
            divideLine.style.left = "" + Layout.getXMiddle();
            document.getElementById("board").prepend(divideLine);
        };
        document.getElementById("buttonDivide").onmouseleave = () => {
            divideLine.remove();
        };
    }



    static getToolbar(): HTMLElement {
        return document.getElementById("controls");
    }

    /**
     * @description toogle the visibility of the toolbar
     */
    static toggle(): void {
        const controls = Toolbar.getToolbar();
        controls.hidden = !controls.hidden;
        Layout.layout();
    }
}
