using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.Experimental.PlayerLoop;
using UnityEngine.UI;

public class TurnText : MonoBehaviour
{
    public bool IsMyTurnText;
    public Text _text;

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        _text = this.GetComponent<Text>();
        _text.enabled = false;
    }

    void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.YourTurn:
                if (IsMyTurnText)
                {
                    EnableText();
                }
                break;
            case GameplayStatus.OpponentTurn:
                if (!IsMyTurnText)
                {
                    EnableText();
                }
                break;
        }
    }

    private void EnableText()
    {
        _text.enabled = true;
        Timer.Instance.Add(1.0f, () =>
        {
            _text.enabled = false;
            Events.Instance.GameplayStatus = GameplayStatus.GetCard;

            Timer.Instance.Add(2.0f, () =>
            {
                Events.Instance.GameplayStatus = GameplayStatus.OpenCard;
            });
        });

    }

}
