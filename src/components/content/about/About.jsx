import style from "./style.module.scss";

const About = () => {
	return (
		<div className={style["container"]}>
			<h1>About Attendance Ai</h1>
			<p>
				This software is built by Gaurav Saini under the guidance of Mr. Manish
				Dubey. It leverages advanced AI technology to monitor the attendance of
				students efficiently and accurately.
			</p>
			<p>
				With this system, educational institutions can automate attendance
				tracking, reducing manual effort and minimizing errors. The software
				uses facial recognition and machine learning algorithms to identify
				students and record their attendance in real-time.
			</p>
			<p>
				Additionally, this solution provides valuable insights and analytics,
				helping educators understand attendance patterns and enhance student
				engagement. The goal is to foster a more organized and efficient
				educational environment.
			</p>
			<p>
				We believe that integrating technology in education not only simplifies
				administrative tasks but also enriches the learning experience for
				students and teachers alike.
			</p>
			<div className={style["footer"]}>
				&copy; 2024 Gaurav Saini. All rights reserved.
			</div>
		</div>
	);
};

export default About;
