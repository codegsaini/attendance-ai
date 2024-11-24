import { ERROR_CAMERA_NOT_FOUND, ERROR_CORRUPT_FRAME, ERROR_ENCODING_FAILED } from "../content/cameras/Cameras";
import style from "./style.module.scss";
import NoVideo from "../../assets/no_video.jpg";
import NoCamera from "../../assets/no_camera.png";
import CorruptFrame from "../../assets/corrupt_frame.jpg";
import Loading from "../../assets/loading.jpg";

const CameraPreview = ({ previewCamera, feed, error, refreshing, onDismissRequest, onRefreshRequest }) => {
	
	let errorImage = NoVideo;
	switch (error) {
		case ERROR_CAMERA_NOT_FOUND:
			errorImage = NoCamera;
			break;
		case ERROR_CORRUPT_FRAME:
			errorImage = CorruptFrame;
			break;
		case ERROR_ENCODING_FAILED:
			errorImage = NoCamera;
			break;
		default:
			errorImage = NoVideo;
	}
	return (
		<div className={style["camera-preview-container"]}>
			<div className={style["info-container"]}>
				<h3>Present Students</h3>
				<div>
					<p>No student present</p>
					{/* <p>PCE21CY018</p>
					<p>PCE21CY019</p> */}
				</div>
			</div>
			<div className={style["preview-container"]}>
				<div className={style['preview-info-wrapper']}>
					<div className={style['preview-info']}>
						<p>{previewCamera.name}</p>
						<p>{previewCamera._class}</p>
						<p>{previewCamera.room}</p>
					</div>
					<button className={style['preview-refresh-button']} onClick={onRefreshRequest}>Refresh</button>
					<button className={style['preview-close-button']} onClick={onDismissRequest}>Close</button>
				</div>
				<div className={style['preview-wrapper']}>
					{!refreshing && feed != undefined && (
						<img className={style["feed-img"]} src={feed} alt={"Camera Preview"} />
					)}
					{!refreshing && feed == undefined && (
						<img
							className={style["no-video-placeholder"]}
							src={errorImage}
							alt={"No video"}
						/>
					)}
					{refreshing && (
						<img
							className={style["no-video-placeholder"]}
							src={Loading}
							alt={"Coming soon"}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CameraPreview;
