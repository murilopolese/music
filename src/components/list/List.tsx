import styles from './List.module.css'
import Item from '../item/Item.tsx'

type ListProps = {
  items: string[];
  selectedItem: string;
  playing: boolean;
  onItemSelect: (item: string) => void;
  onItemShare: (item: string) => void;
  scrollRef: any;
}

function List(props: ListProps) {
  const { 
    items, 
    selectedItem, 
    playing, 
    onItemSelect,
    onItemShare,
    scrollRef
  } = props

  return (
    <div className={styles.list}>
      {items.map(
        (item, i) => {
          return (
            <Item 
              ref={scrollRef}
              key={i}
              onClick={() => onItemSelect(item)}
              onShare={() => onItemShare(item)}
              title={item} 
              selected={item == selectedItem} 
              playing={playing}
              />
          )
        }
        
      )}
    </div>
  )
}

export default List;
