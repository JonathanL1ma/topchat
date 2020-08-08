import React from 'react';
import CenterWrapperStyled from './styled/CenterWrapperStyled'

interface CenterWrapperProps {
    children: React.ReactNode
}

export default (props: CenterWrapperProps) => {
    return (
        <CenterWrapperStyled>
            {props.children}
        </CenterWrapperStyled>
    )
}