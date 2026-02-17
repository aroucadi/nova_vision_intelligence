
import { Composition } from 'remotion';
import { WorkflowLoop } from './WorkflowLoop';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="WorkflowLoop"
                component={WorkflowLoop}
                durationInFrames={300} // 10 seconds @ 30fps
                fps={30}
                width={1280}
                height={720}
            />
        </>
    );
};
