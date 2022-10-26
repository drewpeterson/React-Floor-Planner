import {
	CursorType,
	DeviceMetaData,
	Mode,
	NodeMoveData,
	ObjectEquationData,
	ObjectMetaData,
	Point2D,
	RoomMetaData,
	SnapData,
	ViewboxData,
	WallEquationGroup,
	WallMetaData
} from '../../models/models';
import { CanvasState } from '../';
import { handleMouseMoveBindMode } from './BindModeMouseMoveHandler';
import { handleMouseMoveObjectMode } from './ObjectModeMouseMoveHandler';
import { handleMouseMoveOpeningMode } from './OpeningMouseMoveHandler';
import { handleMouseMoveRoomMode } from './RoomModeMoveHandler';
import { handleMouseMoveSelectMode } from './SelectModeMouseMoveHandler';

export const handleMouseMove = (
	snap: SnapData,
	point: Point2D,
	canvasState: CanvasState,
	viewbox: ViewboxData,
	wallMetaData: WallMetaData[],
	wallUnderCursor: WallMetaData | null,
	setWallMetaData: (w: WallMetaData[]) => void,
	roomMetaData: RoomMetaData[],
	objectMetaData: ObjectMetaData[],
	setObjectMetaData: (o: ObjectMetaData[]) => void,
	handleCameraChange: (lens: string, xmove: number, xview: number) => void,
	setCursor: (crsr: CursorType) => void,
	setWallUnderCursor: (wall: WallMetaData | null) => void,
	setObjectUnderCursor: (o: ObjectMetaData | undefined) => void,
	objectBeingMoved: ObjectMetaData | null,
	setObjectBeingMoved: (o: ObjectMetaData | null) => void,
	setNodeUnderCursor: (p: Point2D | undefined) => void,
	nodeBeingMoved: NodeMoveData | undefined,
	setNodeBeingMoved: (n: NodeMoveData | undefined) => void,
	setRoomUnderCursor: (r: RoomMetaData | undefined) => void,
	setInWallMeasurementText: (wall: WallMetaData, objects: ObjectMetaData[]) => void,
	objectEquationData: ObjectEquationData[],
	wallEquationData: WallEquationGroup,
	dragging: boolean,
	deviceBeingMoved: DeviceMetaData | undefined,
	deviceUnderCursor: DeviceMetaData | undefined
) => {
	if (
		![
			Mode.Device,
			Mode.Object,
			Mode.Room,
			Mode.Opening,
			Mode.Select,
			Mode.Line,
			Mode.Partition,
			Mode.Bind
		].includes(canvasState.mode)
	)
		return;
	switch (canvasState.mode) {
		case Mode.Object: {
			handleMouseMoveObjectMode(
				snap,
				canvasState,
				viewbox,
				wallMetaData,
				objectBeingMoved,
				setObjectBeingMoved
			);
			break;
		}
		case Mode.Room:
			handleMouseMoveRoomMode(snap, roomMetaData, setRoomUnderCursor);
			break;
		case Mode.Opening: {
			handleMouseMoveOpeningMode(
				snap,
				canvasState,
				viewbox,
				wallMetaData,
				objectBeingMoved,
				setObjectBeingMoved
			);
			break;
		}
		case Mode.Select: {
			handleMouseMoveSelectMode(
				snap,
				viewbox,
				setCursor,
				handleCameraChange,
				wallMetaData,
				objectMetaData,
				setWallUnderCursor,
				setObjectUnderCursor,
				point,
				objectBeingMoved,
				setObjectBeingMoved,
				setNodeUnderCursor,
				setInWallMeasurementText,
				dragging,
				deviceUnderCursor
			);
			break;
		}
		case Mode.Line:
		case Mode.Partition:
			break;
		case Mode.Bind: {
			handleMouseMoveBindMode(
				snap,
				setCursor,
				canvasState,
				wallMetaData,
				wallUnderCursor,
				objectMetaData,
				setObjectMetaData,
				setWallMetaData,
				objectBeingMoved,
				setObjectBeingMoved,
				nodeBeingMoved,
				setNodeBeingMoved,
				setInWallMeasurementText,
				objectEquationData,
				wallEquationData,
				deviceBeingMoved
			);
			break;
		}
		default:
			break;
	}
};
