import { useEffect } from 'react';
import styles from './Item.module.css'

type ItemProps = {
    selected: boolean;
    playing: boolean;
    title: string;
    onClick: () => void;
    onShare: () => void;
    ref: any;
}

function Item(props: ItemProps) {
    const { selected, playing, title, onClick, onShare, ref } = props;
    useEffect(() => {
        if (selected) {
            const el = ref.current as HTMLElement;
            if (el) {
                el.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    }, [selected])

    function handleShare(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        onShare();
    }
    
    return (
        <div 
            ref={selected?ref:undefined} 
            onClick={() => onClick()} 
            className={[styles.item, selected?styles.selected:''].join(' ')}
            >
            <button className={styles.control}>
                {selected&&playing ? '||' : '▶︎'}
            </button>
            <div className={styles.title}>
                {title}
            </div>
            <button className={styles.link} onClick={handleShare}>
                ⇥
            </button>
        </div>
    )
}

export default Item;