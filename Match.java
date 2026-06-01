
/**
 * Write a description of class Match here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class Match
{
    private Alliance redAlliance;
    private Alliance blueAlliance;
    private byte bytMatchNumber;

    public Match(Alliance redAlliance, Alliance blueAlliance, byte bytMatchNumber){
        this.redAlliance = redAlliance;
        this.blueAlliance = blueAlliance;
        this.bytMatchNumber = bytMatchNumber;
    }

    public Alliance getMatchWinner(){
        if (this.redAlliance.calculateTotalScore() >= this.blueAlliance.calculateTotalScore()){
            return this.redAlliance;
        }
        else {
            return this.blueAlliance;
        }
    }

    public String getGameSummary(){
        short shrRedScore = this.redAlliance.calculateTotalScore();
        short shrBlueScore = this.blueAlliance.calculateTotalScore();
        String strWinner;
        if (shrRedScore >= shrBlueScore){
            strWinner = "Red";
        }
        else {
            strWinner = "Blue";
        }
        return String.format("Match %d | Red: %d | Blue: %d | Predicted Winner: %s", this.bytMatchNumber, shrRedScore, shrBlueScore, strWinner);
    }

    //Getters and Setters
    public Alliance getRedAlliance(){
        return this.redAlliance;
    }

    public Alliance getBlueAlliance(){
        return this.blueAlliance;
    }

    public byte getMatchNumber(){
        return this.bytMatchNumber;
    }

    public void setRedAlliance(Alliance redAlliance){
        this.redAlliance = redAlliance;
    }

    public void setBlueAlliance(Alliance blueAlliance){
        this.blueAlliance = blueAlliance;
    }

    public void setMatchNumber(byte bytMatchNumber){
        this.bytMatchNumber = bytMatchNumber;
    }
}
