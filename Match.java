
/**
 * Write a description of class Match here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class Match
{
    //instance variables
    private Alliance redAlliance;
    private Alliance blueAlliance;
    private byte bytMatchNumber;
    
    //constructor
    public Match(Alliance redAlliance, Alliance blueAlliance, byte bytMatchNumber){
        this.redAlliance = redAlliance;
        this.blueAlliance = blueAlliance;
        this.bytMatchNumber = bytMatchNumber;
    }
    
    //get the winning alliance
    public Alliance getMatchWinner(){
        //the winning alliance is the one who gets mroe points
        //maybe consider a tie, but this is very rare
        if (this.redAlliance.calculateTotalScore() >= this.blueAlliance.calculateTotalScore()){
            return this.redAlliance;
        }
        else {
            return this.blueAlliance;
        }
    }
    
    //get the summary of the game
    //this method will be used for the match predictor
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
