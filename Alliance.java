
/**
 * Write a description of class Alliance here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */

import java.util.ArrayList;

public class Alliance
{
    private short shrTotalClimbPoints;
    private byte bytTotalPenalties;

    private static short shrNumAlliances = 0;

    private ArrayList<Robot> robots;

    public Alliance(Robot robo1, Robot robo2, Robot robo3){
        this.robots = new ArrayList<Robot>();
        this.robots.add(robo1);
        this.robots.add(robo2);
        this.robots.add(robo3);
        Alliance.shrNumAlliances++;
        this.updateAggregateStats();
    }

    public Alliance(ArrayList<Robot> robots){
        this.robots = new ArrayList<Robot>(robots);
        Alliance.shrNumAlliances++;
        this.updateAggregateStats();
    }

    public short calculateTotalScore(){
        short totalAllianceScore = 0;

        for(Robot robot: this.robots){
            totalAllianceScore += robot.getIndividualScore();
        }

        return totalAllianceScore;
    }

    public boolean boolIsAllianceFull(){
        if (this.robots.size() >= 3){
            return true;
        }
        else {
            return false;
        }
    }

    public void addRobot(Robot robot){
        if (this.boolIsAllianceFull() == false){
            this.robots.add(robot);
            this.updateAggregateStats();
        }
    }

    public static short getNumAlliances(){
        return Alliance.shrNumAlliances;
    }

    private void updateAggregateStats(){
        this.shrTotalClimbPoints = 0;
        this.bytTotalPenalties = 0;

        for(Robot robot: this.robots){
            this.shrTotalClimbPoints += robot.getClimbLevel() * 10;

            if (robot instanceof ScoutedRobot){
                ScoutedRobot scoutedRobot = (ScoutedRobot) robot;

                this.bytTotalPenalties += scoutedRobot.getMinorPenalties() + scoutedRobot.getMajorPenalties();
            }
        }
    }

    //Getters and Setters
    public ArrayList<Robot> getRobots(){
        return this.robots;
    }

    public short getTotalClimbPoints(){
        return this.shrTotalClimbPoints;
    }

    public byte getTotalPenalties(){
        return this.bytTotalPenalties;
    }
}
