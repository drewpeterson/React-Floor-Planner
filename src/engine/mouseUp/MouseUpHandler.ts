import React from 'react';

import { constants } from '../../../constants';
import {
	CursorType,
	DeviceMetaData,
	Mode,
	NodeMoveData,
	ObjectMetaData,
	Point2D,
	RoomDisplayData,
	RoomMetaData,
	SnapData,
	WallEquationGroup,
	WallMetaData
} from '../../models/models';
import { Wall } from '../../models/Wall';
import { getUpdatedObject } from '../../utils/svgTools';
import { distanceBetween } from '../../utils/utils';
import { CanvasState } from '../';
import { handleMouseUpBindMode } from './BindModeMouseUpHandler';

export const handleMouseUp = (
	snap: SnapData,
	mode: Mode,
	setMode: (m: Mode) => void,
	setAction: (a: boolean) => void,
	point: Point2D,
	setPoint: (p: Point2D) => void,
	canvasState: CanvasState,
	save: () => void,
	updateRoomDisplayData: (data: RoomDisplayData) => void,
	continuousWallMode: boolean,
	startModifyingOpening: (object: ObjectMetaData) => void,
	wallClicked: (wall: WallMetaData) => void,
	setCursor: (crsr: CursorType) => void,
	roomMetaData: RoomMetaData[],
	objectMetaData: ObjectMetaData[],
	setObjectMetaData: (o: ObjectMetaData[]) => void,
	wallMetaData: WallMetaData[],
	setWallMetaData: (w: WallMetaData[]) => void,
	wallEndConstructionData: { start: Point2D; end: Point2D } | null,
	wallConstructionShouldEnd: boolean,
	startWallDrawing: (startPoint: Point2D) => void,
	selectedWallData: { wall: WallMetaData; before: Point2D } | null,
	objectBeingMoved: ObjectMetaData | null,
	setObjectBeingMoved: (o: ObjectMetaData | null) => void,
	setNodeBeingMoved: (n: NodeMoveData | undefined) => void,
	roomUnderCursor: RoomMetaData | undefined,
	selectRoomUnderCursor: () => void,
	clearWallHelperState: () => void,
	wallEquations: WallEquationGroup,
	deviceBeingMoved: DeviceMetaData | undefined,
	setDeviceBeingMoved: (d: DeviceMetaData | undefined) => void,
	setDevices: React.Dispatch<React.SetStateAction<DeviceMetaData[]>>
) => {
	const { followerData } = canvasState;
	setCursor('default');

	switch (mode) {
		case Mode.Device: {
			if (deviceBeingMoved) {
				setDevices((prev) => [
					...prev.filter((d) => d.id !== deviceBeingMoved.id),
					deviceBeingMoved
				]);
			}
			setMode(Mode.Select);
			save();
			break;
		}
		case Mode.Object: {
			if (objectBeingMoved) {
				setObjectMetaData([...objectMetaData, objectBeingMoved]);
				setObjectBeingMoved(null);
			}
			setMode(Mode.Select);
			save();
			break;
		}
		case Mode.Room: {
			if (roomUnderCursor == null) {
				break;
			}
			const area = roomUnderCursor.area / 3600;
			selectRoomUnderCursor();
			updateRoomDisplayData({
				size: area.toFixed(2),
				roomIndex: roomMetaData.indexOf(roomUnderCursor),
				surface: roomUnderCursor.surface,
				showSurface: roomUnderCursor.showSurface,
				background: roomUnderCursor.color,
				name: roomUnderCursor.name,
				action: roomUnderCursor.action
			});

			setMode(Mode.EditRoom);
			save();
			break;
		}
		case Mode.Opening: {
			if (!objectBeingMoved) {
				setMode(Mode.Select);
				break;
			}
			const newObjectBeingMoved = getUpdatedObject(objectBeingMoved);
			const updatedObjects = [...objectMetaData, newObjectBeingMoved];
			setObjectBeingMoved(null);
			setObjectMetaData(updatedObjects);
			// $('#boxinfo').html('Element added');
			setMode(Mode.Select);
			save();
			break;
		}
		case Mode.Line:
		case Mode.Partition: {
			clearWallHelperState();
			if (!wallEndConstructionData) return;
			let sizeWall = distanceBetween(wallEndConstructionData.end, point);
			sizeWall = sizeWall / constants.METER_SIZE;
			if (wallEndConstructionData && sizeWall > 0.3) {
				sizeWall = mode === Mode.Partition ? constants.PARTITION_SIZE : constants.WALL_SIZE;
				const wall = new Wall(
					wallEndConstructionData.start,
					wallEndConstructionData.end,
					'normal',
					sizeWall
				);
				const updatedWalls = [...wallMetaData, wall];
				setWallMetaData(updatedWalls);

				if (continuousWallMode && !wallConstructionShouldEnd) {
					setCursor('validation');
					setAction(true);
					startWallDrawing(wallEndConstructionData.end);
				} else setAction(false);
				// $('#boxinfo').html(
				// 	"Wall added <span style='font-size:0.6em'>approx. " +
				// 		(distanceBetween(point, wallEndConstructionData.end) / 60).toFixed(2) +
				// 		' m</span>'
				// );
				if (wallConstructionShouldEnd) setAction(false);
				save();
			} else {
				setAction(false);
				// $('#boxinfo').html('Select mode');
				setMode(Mode.Select);
				setPoint({ x: snap.x, y: snap.y });
			}
			break;
		}
		case Mode.Bind: {
			const { updatedMode, updatedObjectMeta } = handleMouseUpBindMode(
				objectMetaData,
				startModifyingOpening,
				selectedWallData,
				wallClicked,
				() => {
					wallEquations.equation1 = null;
					wallEquations.equation2 = null;
					wallEquations.equation3 = null;
					followerData.intersection = null;
				},
				objectBeingMoved,
				setObjectBeingMoved
			);
			setMode(updatedMode);
			setObjectMetaData(updatedObjectMeta);
			setNodeBeingMoved(undefined);
			save();
			break;
		}
		default:
			break;
	}
};
