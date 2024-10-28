import React from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

function ProjectCard({ children, className, id }) {
    return (
        
        <Link to={`/code-editor/${id}`}>
            <div
                tabIndex={0}
                className={cn(
                    className,
                    "rounded-lg border bg-card text-card-secondary shadow h-48 p-[1px] gradient-project-card-bg cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
            >
                <div className='rounded-[7px] h-full flex flex-col justify-between gradient-project-card'>
                    {children}
                </div>
            </div>
        </Link>
    );
}

export default ProjectCard;
