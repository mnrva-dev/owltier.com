import { useState, } from 'react'
import TeamCard from '../../Components/TeamCard'
import type { ListContext } from '../Build'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core';
import { useOutletContext } from 'react-router-dom';
import TierBreak from '../../Components/TierBreak';

export default function SplitRegion() {
    const lc = useOutletContext<ListContext>()
    const [list, setList] = lc
    const {na, apac} = list
    const [nateams, setNA] = useState(na)
    const [apacteams, setAPAC] = useState(apac)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
          })
        )
    // start at -1 so that the first break is id 0
    let breakId = -1
    return (
        <div style={{
            display: 'flex',
            width: '500px',
            gap: '30px',
            margin: 'auto',
            }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="na">
                    <SortableContext
                        items={nateams}
                        strategy={verticalListSortingStrategy}
                    >
                        {nateams.map((id) => {
                            breakId += 1
                            return (
                            <>
                            <TeamCard listContext={lc} id={id} breakId={breakId}/>
                            {/* should not render the very last tier break */}
                            {breakId != nateams.length-1 ? <TierBreak listContext={lc} id={breakId} /> : null}
                            </>
                            )
                        })}
                    </SortableContext>
                </div>
            </DndContext>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndApac}
            >
                <div className="apac">
                    <SortableContext
                        items={apacteams}
                        strategy={verticalListSortingStrategy}
                    >
                        {apacteams.map((id) => {
                            breakId += 1
                            return (
                                <>
                                <TeamCard listContext={lc} id={id} breakId={breakId}/>
                                {/* should not render the very last tier break */}
                                {breakId != (nateams.length+apacteams.length)-1 ? <TierBreak listContext={lc} id={breakId} /> : null}
                                </>
                                )
                        })}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    )

    function handleDragEnd(event: { active: any; over: any; }) {
        const {active, over} = event;
        
        if (active.id !== over.id) {
          setNA((items: string | any[]) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            
            let narr = arrayMove(nateams, oldIndex, newIndex);
            setList({
                format: 'split',
                na: narr,
                apac: list.apac,
                combined: list.combined,
                breaks: list.breaks
            })
            return narr
          });
        }
    }
    
    function handleDragEndApac(event: { active: any; over: any; }) {
        const {active, over} = event;
        
        if (active.id !== over.id) {
          setAPAC((items: string | any[]) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            
            let narr = arrayMove(apacteams, oldIndex, newIndex);
            setList({
                format: 'split',
                na: list.na,
                apac: narr,
                combined: list.combined,
                breaks: list.breaks
            })
            return narr
          });
        }
    }
    
}