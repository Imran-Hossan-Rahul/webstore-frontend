"use client";
import React, { memo, useState, useEffect } from 'react';
import { LayoutGrid, StretchHorizontal } from "lucide-react";
import CustomSelect from '../ui/CustomSelect';

const VIEW_OPTIONS = [
    { value: 'list', label: 'List',  icon: StretchHorizontal },
    { value: 'grid', label: 'Card',  icon: LayoutGrid },
];

const ViewToolbar = memo(({ 
    viewMode, 
    setViewMode, 
    gridCols,
    setGridCols,
    categories = [],
    activeCategory,
    setActiveCategory,
    sortOptions = [],
    sortBy,
    setSortBy,
    noBorder = false
}) => {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowWidth(window.innerWidth);
            }, 100);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const gridOptions = [];
    if (windowWidth >= 640) {
        gridOptions.push({ value: 2, label: '2 Columns' });
    }
    if (windowWidth >= 1024) {
        gridOptions.push({ value: 3, label: '3 Columns' });
    }
    if (windowWidth >= 1536) {
        gridOptions.push({ value: 4, label: '4 Columns' });
    }

    // Auto-adjust if selected gridCols is no longer available
    useEffect(() => {
        if (viewMode === 'grid' && setGridCols) {
            const currentVal = Number(gridCols);
            if (windowWidth < 640 && currentVal > 1) {
                setGridCols(1); // Usually grid components default to 1 on small screens
            } else if (windowWidth >= 640 && windowWidth < 1024 && currentVal > 2) {
                setGridCols(2);
            } else if (windowWidth >= 1024 && windowWidth < 1536 && currentVal > 3) {
                setGridCols(3);
            }
        }
    }, [windowWidth, viewMode, gridCols, setGridCols]);

    return (
        <div className={`flex items-center justify-end w-full gap-3 ${noBorder ? '' : 'border-b border-slate-100 dark:border-white/10 pb-3 mb-4'}`}>

            {/* Category or Sort */}
            {sortOptions && sortOptions.length > 0 && (
                <CustomSelect 
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    dropdownWidth="w-48"
                    placeholder="Sort by"
                />
            )}

            {(!sortOptions || sortOptions.length === 0) && categories && categories.length > 0 && (
                <CustomSelect 
                    options={categories}
                    value={activeCategory}
                    onChange={setActiveCategory}
                    dropdownWidth="w-48"
                    searchable={true}
                />
            )}

            {/* View & Grid Controls */}
            <CustomSelect 
                options={VIEW_OPTIONS}
                value={viewMode}
                onChange={setViewMode}
                dropdownWidth="w-44"
            />

            {viewMode === 'grid' && gridOptions.length > 0 && (
                <CustomSelect 
                    options={gridOptions}
                    value={gridOptions.find(o => o.value === gridCols) ? gridCols : (gridOptions[gridOptions.length - 1]?.value || 2)}
                    onChange={setGridCols}
                    dropdownWidth="w-44"
                />
            )}

        </div>
    );
});

ViewToolbar.displayName = 'ViewToolbar';

export default ViewToolbar;
